import { writeWebData } from "./helpers/writeDataToFile.ts";
import { loggingHandler } from "./helpers/loggingHandler.ts";
import { LeagueData, ParsedJsonFromWeb } from "./types/datatypes.d.ts";
import { isParsedJsonFromWeb } from "./helpers/checkDataType.ts";

class FetchDataFromWeb {
  /**
   * Fetches data from the URLs defined in the environment variable.
   */
  async fetchDataFromWeb() {
    
    const urls = Deno.env.get("FETCH_EPL_2024");

    if (!urls) {
      loggingHandler("No URLs found in the environment variable ");
      Deno.exit(1);
    }

    try {
      const fetchPromises: Promise<Response>[] = this.createFetchPromises(urls);
      const responses: PromiseSettledResult<Response>[] = await Promise.allSettled(fetchPromises);
      await this.handleResponses(responses);
    } catch (error) {
      loggingHandler(`Fetch failed: ${error.message}`);
    }
  }

  /**
   * Creates an array of fetch promises from the provided URLs.
   *
   * @param urls - A string of URLs to fetch.
   * @returns Promise Response[] An array of promises that represent the fetch requests.
   */
  private createFetchPromises(urls: string): Promise<Response>[] {
    return urls.split(/[ ,]+/).map((url) => fetch(url));
  }

  /**
   * Handles the responses from the fetch requests.
   *
   * @param responses - An array of promise settlement results (fulfilled or rejected).
   */
  private async handleResponses(responses: PromiseSettledResult<Response>[]): Promise<void> {
    const promises = responses.map((response) => {
      if (response.status === "fulfilled") {
        this.checkHttpResponse(response.value);
      } else {
        loggingHandler(`Failed to fetch: ${response.reason}`);
      }
    });
    await Promise.all(promises);
  }

  /**
   * Checks if the response is valid (status 200 and JSON content type).
   *
   * If the response is valid calls: @function parseData(fulfilledResponses)
   *
   * @param fulfilledResponses - The fulfilled fetch response.
   */
  private async checkHttpResponse(fulfilledResponses: Response) {
    const HTTP_OK = 200;
    const CONTENT_TYPE_JSON = "application/json";
    if (fulfilledResponses.status !== HTTP_OK || !fulfilledResponses.headers.get("content-type")?.includes(CONTENT_TYPE_JSON)) {
      return loggingHandler(`ERROR status(${fulfilledResponses.status}) unable to access: ${fulfilledResponses.url}\n`);
    }
    await this.parseData(fulfilledResponses);
  }

  /**
   * Parses JSON data from an HTTP response and stores extracted information.
   *
   * @async
   * @param {Response} settledResponses - Fulfilled HTTP response.
   * @returns {Promise<void>} - Resolves after data is processed and saved.
   * @throws {Error} If JSON parsing or data extraction fails.
   */
  private async parseData(settledResponses: Response): Promise<void> {
    const token: string = this.getTokenFromUrl(settledResponses);
    try {
      const fixtures: ParsedJsonFromWeb = await settledResponses.json();
      const extractedData: LeagueData = this.extractRelevantData(token, fixtures);
      await writeWebData(token, extractedData);
    } catch (err) {
      loggingHandler(`ERROR: Unable to read content body from: ${settledResponses.url} - ${err.message}`);
      throw err;
    }
  }

  /**
   * Extracts the token from the given URL.
   *
   * {@link extractRelevantData} - uses it to create league key
   *
   * {@link ./server/helpers/writeDataToFile.ts#writeParsedData}  - uses it to create file to write generated data
   *
   * {@link getLocalFilePath} - uses it to create file to write generated data
   *
   * @param url - The URL from which to extract the token.
   * @returns The extracted token as a string.
   */
  private getTokenFromUrl(settledResponses: Response): string {
    return settledResponses.url.substring(settledResponses.url.lastIndexOf(`/`) + 1);
  }

  /**
   * Step 1 - Filter the fixtures to include only those that have been played.
   *
   * Step 2 - Extracts relevant data from the parsed fixtures.
   *
   * @param token - The unique token to associate with the data.
   * @param fixtures - The parsed JSON data representing match details.
   * @returns An object containing the extracted data.
   */
  private extractRelevantData(token: string, fixtures: ParsedJsonFromWeb): LeagueData {
    if (!isParsedJsonFromWeb(fixtures)) {
      throw new Error(`Invalid fixtures data structure in func extractedData`);
    }
    const extractedData = {
      [token]: fixtures
        .filter((fixture) => {
          return (fixture.HomeTeamScore !== null &&
            fixture.AwayTeamScore !== null &&
            typeof fixture.HomeTeamScore === "number" &&
            typeof fixture.AwayTeamScore === "number");
        })
        .map((extract) => ({
          HomeTeam: extract.HomeTeam,
          HomeTeamScore: extract.HomeTeamScore as number,
          AwayTeam: extract.AwayTeam,
          AwayTeamScore: extract.AwayTeamScore as number,
        })),
    };
    return extractedData;
  }
}
