import { loggingHandler } from "./loggingHandler.ts";
import { ParsedJsonFromWeb } from "../types/datatypes.d.ts";
import { writeWebData } from "./writeDataToFile.ts";

// Exported asynchronous function to parse data from a settled response.
export async function parseData(settledResponses: Response): Promise<void> {
  const token: string = settledResponses.url.substring(settledResponses.url.lastIndexOf(`/`) + 1);
  try {
    const fixtures: ParsedJsonFromWeb = await settledResponses.json();
    extractRelevantData(token, fixtures);
  } catch (err) {
    loggingHandler(`ERROR: Unable to read content body from: ${settledResponses.url} - ${err.message}`);
  }
}

// Function to extract relevant data from the parsed fixtures.
function extractRelevantData(token: string, fixtures: ParsedJsonFromWeb): void {
  // Filter the fixtures to include only those that have been played.
  const extractedData = {
    [token]: fixtures
      .filter((fixture) => fixture.HomeTeamScore != null && fixture.AwayTeamScore != null)
      .map(extract => ({
        HomeTeam: extract.HomeTeam,            
        HomeTeamScore: extract.HomeTeamScore as number,  
        AwayTeam: extract.AwayTeam,            
        AwayTeamScore: extract.AwayTeamScore as number,  
      }))
  }
  
  // Call the function to write the extracted data to file.
  writeWebData(token, extractedData);
}
