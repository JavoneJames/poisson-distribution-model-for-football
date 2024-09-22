import { loggingHandler } from "./helpers/loggingHandler.ts";
import { parseData } from "./helpers/parseData.ts";

class FetchDataFromWeb {
  
   /**
   * Fetches data from the URLs defined in the environment variable.
   */
  async fetchDataFromWeb() {
    const urls = Deno.env.get("FETCH_EPL_2024");
    if (!urls) {
      throw new Error("No URLs found in the environment variable ");
    }

    try {
      const fetchPromises: Promise<Response>[] = this.createFetchPromises(urls);
      const responses: PromiseSettledResult<Response>[] = await Promise.allSettled(fetchPromises);
      this.handleResponses(responses);
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
    return urls.split(" ").map((url) => fetch(url));
  }

  /**
   * Handles the responses from the fetch requests.
   *
   * @param responses - An array of promise settlement results (fulfilled or rejected).
   */
  private async handleResponses(responses: PromiseSettledResult<Response>[]): Promise<void> {

    const promises = responses.map(async (response) => {
      if (response.status === "fulfilled"){
        await this.checkHttpResponse(response.value)
      }else{
        loggingHandler(`Failed to fetch: ${response.reason}`);
      }
    })
    await Promise.all(promises)

  }

  /**
   * Checks if the response is valid (status 200 and JSON content type).
   *
   *If the response is valid calls: @function parseData(fulfilledResponses)
   * 
   * @param fulfilledResponses - The fulfilled fetch response.
   */
  private async checkHttpResponse(fulfilledResponses: Response): Promise<void> {
    const HTTP_OK = 200;
    const CONTENT_TYPE_JSON = "application/json";
    if (fulfilledResponses.status !== HTTP_OK || !fulfilledResponses.headers.get("content-type")?.includes(CONTENT_TYPE_JSON)) {
      return loggingHandler(`ERROR status(${fulfilledResponses.status}) unable to access: ${fulfilledResponses.url}\n`);
    }
    await parseData(fulfilledResponses)
  }

}