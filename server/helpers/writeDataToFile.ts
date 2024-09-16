import { HomeAwayStanding, LeagueData } from "../types/datatypes.d.ts";
import { loggingHandler } from "./loggingHandler.ts";

/**
 * Writes the given data to a file at the specified filepath.
 * 
 * @param filepath - The path where the data should be written.
 * @param data - The data to be written to the file, either as a Map or LeagueData.
 */
async function writeDataToFile(filepath: string, data: Map<string, HomeAwayStanding> | LeagueData): Promise<void> {
  try {
    using file: Deno.FsFile = await Deno.open(filepath, { write: true, create: true });
    const serializedData: string = serializeData(data);
    const encoder = new TextEncoder().encode(serializedData);
    const writer = file.writable.getWriter();
    await writer.write(encoder);
  } catch (error) {
    loggingHandler(`Failed to write data to file: ${error.message}`);
    Deno.exit(0)
  }
}

/**
 * Serializes the given data into a JSON string format.
 * 
 * @param data - The data to serialize, its type can be either a Map or LeagueData.
 * @returns A serialized JSON string of the data.
 */
function serializeData(data: Map<string, HomeAwayStanding> | LeagueData) {
  if (data instanceof Map) {
    return JSON.stringify(Array.from(data.entries()));
  }
  return JSON.stringify(data);
}

/**
 * Writes data fetch from web to a file specified by the token.
 * 
 * @param token - A string used to generate the file path.
 * @param data - The data to write to the file.
 */
export async function writeWebData(token: string, data: LeagueData): Promise<void> {
  const filepath = getFilePathFromToken(token);
  await writeDataToFile(filepath, data);
}

/**
 * Generates the file path from a given token.
 * 
 * @param token - The token to use for generating the file path.
 * @returns The generated file path as a string.
 */
function getFilePathFromToken(token: string): string {
  return `./server/data/${token}.json`;
}

/**
 * Writes parsed league standings data to a file.
 * 
 * @param league - The league name to include in the file path.
 * @param filename - The filename for the local standings data.
 * @param data - The parsed data to write to the file.
 */
export async function writeParsedData(league: string | null, filename: string, data: Map<string, HomeAwayStanding>): Promise<void> {
  const filepath = getLocalFilePath(league, filename);
  await writeDataToFile(filepath, data);
}

/**
 * Generates the file path for parsed data league based on league and filename.
 * 
 * @param league - The league name to include in the file path.
 * @param filename - The filename for the data.
 * @returns The generated file path as a string.
 */
function getLocalFilePath(league: string | null, filename: string): string {
  return `./server/data/${league}-${filename}.json`;
}
