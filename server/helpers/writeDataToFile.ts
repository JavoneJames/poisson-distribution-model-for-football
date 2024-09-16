import { HomeAwayStanding } from "../types/datatypes.d.ts";

type ExtractedObject = {
  [league: string]: {
    HomeTeam: string;
    HomeTeamScore: number;
    AwayTeam: string;
    AwayTeamScore: number;
  }[];
};

async function writeDataToFile(filepath: string, data: Map<string, HomeAwayStanding> | ExtractedObject): Promise<void> {
  using file = await Deno.open(filepath, { write: true, create: true });
  const serializedData: string = serializeData(data);
  const encoder = new TextEncoder().encode(serializedData);
  const writer = file.writable.getWriter();
  await writer.write(encoder);
}

function serializeData(data: Map<string, HomeAwayStanding> | ExtractedObject) {
  if (data instanceof Map)
    return JSON.stringify(Array.from(data.entries()));
  return JSON.stringify(data);
}

export async function writeWebData(token: string, data: ExtractedObject): Promise<void> {
  const filepath = getFilePathFromToken(token);
  await writeDataToFile(filepath, data);
}

function getFilePathFromToken(token: string): string {
  return `./server/data/${token}.json`;
}

export async function writeLocalData(league: string | null, filename: string, data: Map<string, HomeAwayStanding>): Promise<void> {
  const filepath = getLocalFilePath(league, filename);
  await writeDataToFile(filepath, data);
}

function getLocalFilePath(league: string | null, filename: string): string {
  return `./server/data/${league}-${filename}.json`;
}
