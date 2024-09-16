import { loggingHandler } from "./loggingHandler.ts";
import { LeagueData } from "../types/datatypes.d.ts";

/**
 * Reads and parses fixture data from a specified file path.
 *
 * @param filePath - The file path to read the fixture data from.
 * @returns An array of LeagueData representing the match data.
 * @throws Will throw an error if the file path is invalid or if there are issues reading or parsing the file.
 */
export function readDataFromFile(filePath: string): LeagueData[] {
  if (isValidPath(filePath)) {
    throw new Error(`File path not found in environment variable: ${filePath}`);
  }
  const arrayOfFilePaths = filePath.split(" ");
  return arrayOfFilePaths.map(readAndParseFile);
}

/**
 * Checks if the given file path is invalid.
 *
 * @param filePath - The file path to check.
 * @returns True if the path is invalid, false otherwise.
 */
function isValidPath(filePath: string) {
  return typeof filePath !== "string" || filePath.trim() === "";
}

/**
 * Reads and parses a file, returning its content as LeagueData.
 *
 * @param path - The path to the file to read.
 * @returns The parsed LeagueData or throws an error if reading fails.
 */
function readAndParseFile(path: string): LeagueData {
  try {
    const fileContent = Deno.readTextFileSync(path);
    const data = JSON.parse(fileContent) as LeagueData;

    if (isEmpty(data)) {
      throw new Error(`Data is empty for file: ${path}`);
    }
    return data;
  } catch (error) {
    loggingHandler(
      `Failed to read or parse file: ${path}. Error: ${error.message}`,
    );
    throw error; // Rethrow the error for upstream handling.
  }
}

/**
 * Checks if the given data structure is empty.
 *
 * @param data - The data structure to check.
 * @returns True if the data structure is empty, false otherwise.
 */
const isEmpty = (
  data: { [s: string]: unknown } | ArrayLike<unknown>,
): boolean => {
  return Object.keys(data).length === 0;
};
