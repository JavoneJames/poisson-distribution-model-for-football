import { loggingHandler } from "./loggingHandler.ts";
import { ParsedJsonFromWeb, LeagueData } from "../types/datatypes.d.ts";
import { writeWebData } from "./writeDataToFile.ts";

/**
 * Parses JSON data from an HTTP response and stores extracted information.
 *
 * @async
 * @param {Response} settledResponses - Fulfilled HTTP response.
 * @returns {Promise<void>} - Resolves after data is processed and saved.
 * @throws {Error} If JSON parsing or data extraction fails.
 */
export async function parseData(settledResponses: Response): Promise<void> {
  const token: string = getTokenFromUrl(settledResponses);
  try {
    const fixtures: ParsedJsonFromWeb = await settledResponses.json();
    const extractedData = extractRelevantData(token, fixtures);
    writeWebData(token, extractedData);
  } catch (err) {
    loggingHandler(`ERROR: Unable to read content body from: ${settledResponses.url} - ${err.message}`);
  }
}

/**
 * Extracts the token from the given URL.
 * 
 * @function extractRelevantData - uses it to create league key 
 * @function writeParsedData - uses it to create file to write generated data
 * @function getLocalFilePath - uses it to create file to write generated data
 * @param url - The URL from which to extract the token.
 * @returns The extracted token as a string.
 */
function getTokenFromUrl(settledResponses: Response): string {
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
function extractRelevantData(token: string, fixtures: ParsedJsonFromWeb): LeagueData {
  const extractedData = {
    [token]: fixtures
      .filter((fixture) => fixture.HomeTeamScore != null && fixture.AwayTeamScore != null)
      .map((extract) => ({
        HomeTeam: extract.HomeTeam,
        HomeTeamScore: extract.HomeTeamScore as number,
        AwayTeam: extract.AwayTeam,
        AwayTeamScore: extract.AwayTeamScore as number,
      })),
  };
  return extractedData
}
