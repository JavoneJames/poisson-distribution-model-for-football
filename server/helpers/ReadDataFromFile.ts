import { loggingHandler } from "./loggingHandler.ts";
import { AllLeagueStandings, LeagueData } from "../types/datatypes.d.ts";

/**
 * Reads and parses fixture data from specified file paths.
 *
 * @param filePath - The file path(s) to read the fixture data from.
 * @returns A Promise that resolves to an array of LeagueData or AllLeagueStandings.
 * @throws Will throw an error if the file path is invalid or if all data files are empty or invalid.
 */
export async function readDataFromFile(filePath: string): Promise<(LeagueData | AllLeagueStandings)[]> {
  validateFilePath(filePath);
  const arrayOfFilePaths: string[] = filePath.split(" ");
  
  const parsedDataArray: Promise<LeagueData | AllLeagueStandings>[] = arrayOfFilePaths.map(readAndParseFile)
  const results: (LeagueData | AllLeagueStandings)[] = await Promise.all(parsedDataArray);

  const filteredResults: (LeagueData | AllLeagueStandings)[] = results.filter((result) => result !== null && result !== undefined);

  if (filteredResults.length === 0) {
    throw new Error("All data files are empty or contain invalid data.");
  }

  return filteredResults;
}

/**
 * Validates the given file path.
 *
 * @param filePath - The file path to validate.
 * @throws Will throw an error if the file path is invalid.
 */
function validateFilePath(filePath: string) {
  if (typeof filePath !== "string" || filePath === undefined) {
    throw new Error(`File path not found in environment variable: ${filePath}`);
  }
}

/**
 * Reads and parses a file, returning its content as LeagueData.
 *
 * @param path - The path to the file to read.
 * @returns The parsed LeagueData or throws an error if reading fails.
 */
async function readAndParseFile(path: string): Promise<(LeagueData | AllLeagueStandings)> {
  try {
    const fileContent: string = await Deno.readTextFile(path);
    return JSON.parse(fileContent) as LeagueData | AllLeagueStandings;
  } catch (error) {
    loggingHandler(`Failed to read or parse file: ${path}. Error: ${error.message}`);
    throw error; // Rethrow the error for upstream handling.
  }
}
