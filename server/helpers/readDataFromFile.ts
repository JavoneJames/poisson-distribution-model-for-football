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

export function readDataFromFile(filePath: string): (LeagueData | null)[] {
  if (isValidPath(filePath)) {
    loggingHandler(`File path not found in environment variable: ${filePath}`);
    Deno.exit(1);
  }
  const arrayOfFilePaths = filePath.split(" ");
  const dataCollection: (LeagueData | null)[] = processFiles(arrayOfFilePaths);
  return dataCollection;
}

function isValidPath(filePath: string) {
  return typeof filePath !== "string" || filePath.trim() === "";
}

function processFiles(paths: string[]): (LeagueData | null)[] {
  const fileContent: (LeagueData | null)[] = paths.map((path) =>
    readAndParseFile(path)
  );
  return fileContent;
}

function readAndParseFile(path: string): LeagueData | null {
  try {
    const fileContent = Deno.readTextFileSync(path);
    const data = JSON.parse(fileContent) as LeagueData;

    if (isEmpty(data)) {
      loggingHandler(`Data is empty for file: ${path}`);
      return null;
    }
    return data;
  } catch (error) {
    loggingHandler(
      `Failed to read or parse file: ${path}. Error: ${error.message}`,
    );
    return null;
  }
}

const isEmpty = (
  data: { [s: string]: unknown } | ArrayLike<unknown>,
): boolean => {
  return Object.keys(data).length === 0;
};
