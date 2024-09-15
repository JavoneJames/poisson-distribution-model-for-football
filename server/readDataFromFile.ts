import { loggingHandler } from "./helpers/loggingHandler.ts";
import { Fixture } from "./types/datatypes.d.ts";

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
export function readDataFromFile(): Fixture[] {
  const filePath = Deno.env.get("READ_EPL_2024");
  if (!filePath) throw new Error("File path not found in environment variable.");
  try {
    const fileContent = Deno.readTextFileSync(filePath);
    return JSON.parse(fileContent) as Fixture[];
  } catch (err) {
    loggingHandler(`Failed to read or parse file: ${err.message}`);
    Deno.exit(1)
  }
}
