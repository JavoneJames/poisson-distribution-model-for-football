async function writeDataToFile(filepath: string, data: object): Promise<void> {
  using file = await Deno.open(filepath, { write: true, create: true });
  const serializedData: string = serializeData(data);
  const encoder = new TextEncoder().encode(serializedData);
  const writer = file.writable.getWriter();
  await writer.write(encoder);
}

function serializeData(data: object) {
  if (data instanceof Map)
    return JSON.stringify(Array.from(data.entries()));
  return JSON.stringify(data);
}

function getFilePathFromToken(token: string): string {
  const { start, end } = subStringTokenToDirName(token);
  return `./server/data${token.substring(start, end)}${token.substring(start)}.json`;
}

function getLocalFilePath(league:string, filename: string): string {
  return `./server/data//${league}/${filename}.json`;
}

export async function writeLocalData(league:string, filename: string, data: object): Promise<void> {
  const filepath = getLocalFilePath(league, filename);
  await writeDataToFile(filepath, data);
}

export async function writeWebData(token: string, data: object): Promise<void> {
  const filepath = getFilePathFromToken(token);
  await writeDataToFile(filepath, data);
}

function subStringTokenToDirName(token: string): { start: number; end: number; } {
  const start = token.indexOf("/");
  const end = token.lastIndexOf("-");
  return { start, end };
}
