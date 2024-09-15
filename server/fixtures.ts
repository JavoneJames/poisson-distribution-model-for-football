import { temp } from "./datatypes.ts";

const options = {
    dateStyle:"short",
    timeStyle: "medium"
}as const

export async function fetchDataFromWeb(urls: Promise<Response>[]): Promise<void>{
  try {
    const responses: PromiseSettledResult<Response>[] = await Promise.allSettled(urls)
    for (const response of responses)
      if (response.status === "fulfilled")
        checkHttpResponse(response.value)
  } catch (err) {
    loggingHandler(`FATAL: unexpected error in fetchDataFromWeb - ${err.message}`);
  }
}

function loggingHandler(reason: string): void {
  const timestamp = new Date().toLocaleString("en-GB", options)
  const logMessage = `${timestamp} - ${reason}\n`
  const logfilePath = Deno.env.get("logfile")
  if (!logfilePath) throw new Error("File path not found in environment variable.")
  Deno.writeTextFileSync(logfilePath, logMessage, { create: true, append: true })
}

function checkHttpResponse(fulfilledResponses: Response): void {
  if (fulfilledResponses.status !== 200 || !fulfilledResponses.headers.get("content-type")?.includes("application/json"))
    return loggingHandler(`ERROR status(${fulfilledResponses.status}) unable to access: ${fulfilledResponses.url}\n`)
  parseData(fulfilledResponses)
}

async function parseData(settledResponses: Response): Promise<void> {
  const token: string = settledResponses.url.substring(settledResponses.url.lastIndexOf(`/`));
  try {
    const fixtures: ParsedJsonFromWeb = await settledResponses.json();
    extractRelevantData(token, fixtures);
  } catch (err) {
    loggingHandler(`ERROR: Unable to read content body from: ${settledResponses.url} - ${err.message}`);
  }
}

function extractRelevantData(token: string, fixtures: ParsedJsonFromWeb): void {
  const extractedData = fixtures
  .filter((fixture) => (fixture.HomeTeamScore && fixture.AwayTeamScore) != null)
  .map((fixture) => ({
      HomeTeam: fixture.HomeTeam,
      HomeTeamScore: fixture.HomeTeamScore,
      AwayTeam: fixture.AwayTeam,
      AwayTeamScore: fixture.AwayTeamScore,
  }));
  writeReceivedFixturesToFile(token, extractedData)
}

async function writeReceivedFixturesToFile(token: string, extractedData: { HomeTeam: string; HomeTeamScore: number; AwayTeam: string; AwayTeamScore: number; }[]): Promise<void> {
  const filepath = getFilePath(token);
  using file = await Deno.open(filepath, {write:true, create:true})
  const encoder = new TextEncoder().encode(JSON.stringify(extractedData))
  const writer = file.writable.getWriter()
  await writer.write(encoder)
}

function getFilePath(token: string): string {
  const { start, end } = subStringTokenToDirName(token);
  return `./data${token.substring(start, end)}${token.substring(start)}.json`;
}

function subStringTokenToDirName(token: string): { start: number; end: number; } {
  const start = token.indexOf("/");
  const end = token.lastIndexOf("-");
  return { start, end };
}

fetchDataFromWeb([
  fetch(`${Deno.env.get("FETCH_EPL_2024")}`, { signal: temp }),
]);