import { loggingHandler } from "./loggingHandler.ts";
import { LeagueData } from "../types/datatypes.d.ts";

/**
 * Reads and parses fixture data from a specified file.
 *
 * This function retrieves the file path from the environment variable
 * "READ_EPL_2024" and reads the content of the file. It then parses
 * the JSON content into an array of Fixture objects. If the file path
 * is not found in the environment variable or if there is an error
 * reading or parsing the file, it throws an appropriate error message.
 *
 * @returns An array of Fixture objects representing the match data.
 * @throws Will throw an error if the file path is not set in the environment
 *         variable or if there are issues reading or parsing the file.
 */
export function readDataFromFile(filePath: string): LeagueData[] {
  if (!filePath) {
    throw new Error("File path not found in environment variable.");
  }

  const arrayOfFilePaths = filePath.split(" ");
  const dataCollection: LeagueData[] = [];

  for (const path of arrayOfFilePaths) {
    try {
      const fileContent = Deno.readTextFileSync(path);
      const data = JSON.parse(fileContent) as LeagueData;

      if (isEmpty(data)) {
        loggingHandler(`data is empty for file: ${path}`);
        continue; // Move to the next file if the data is empty
      }
      dataCollection.push(data);
    } catch (err) {
      loggingHandler(
        `Failed to read or parse file: ${path}. Error: ${err.message}`,
      );
      // Don't exit here, move to the next path
    }
  }
  if (dataCollection.length === 0) {
    throw new Error("Failed to read or parse data from all provided file paths.");
  }
  return dataCollection;
}

const isEmpty = (
  data: { [s: string]: unknown } | ArrayLike<unknown>,
): boolean => {
  return Object.keys(data).length === 0;
};
