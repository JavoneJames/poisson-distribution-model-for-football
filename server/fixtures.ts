const options = {
    dateStyle:"short",
    timeStyle: "medium"
}as const

export async function fetchDataFromWeb(urls: Promise<Response>[]){
  try {
    const responses: PromiseSettledResult<Response>[] = await Promise.allSettled(urls)
    for await(const response of responses)
      if (response.status === "fulfilled")
        checkHttpResponse(response.value)
  } catch (_) {
    loggingHandler('FATAL unexpected error in func fetchDataFromWeb')
  }
}

function loggingHandler(reason: string) {
  Deno.writeTextFileSync(`${Deno.env.get("logfile")}`, `${new Date().toLocaleString("en-GB", options)} ${reason}`, {create:true, append:true})
}

function checkHttpResponse(fulfilledResponses: Response) {
  if (fulfilledResponses.status !== 200 || !fulfilledResponses.headers.get("content-type")?.includes("application/json"))
    return loggingHandler(`ERROR unable to access: ${fulfilledResponses.url}\n`)
  parseData(fulfilledResponses)
}

async function parseData(settledResponses: Response) {
  const token: string = settledResponses.url.substring(settledResponses.url.lastIndexOf(`/`));
  await settledResponses.json()
  .then((fixtures)=>{
    extractRelevantData(token, fixtures)
  })
  .catch(()=>{
    return loggingHandler(`ERROR unable to read content body from: ${settledResponses.url}\n`)
  })
}

function extractRelevantData(token: string, fixtures: Promise<JSON>) {
  const storedExtractedData = Object.values(fixtures)
  .filter((fixture)=>{
    return ((fixture.HomeTeamScore && fixture.AwayTeamScore) !== null)
  })
  .map((fixture)=>{
     return {
      HomeTeam: fixture.HomeTeam,
      HomeTeamScore: fixture.HomeTeamScore, 
      AwayTeam: fixture.AwayTeam, 
      AwayTeamScore: fixture.AwayTeamScore
    }
  })
  writeReceivedFixturesToFile(token, storedExtractedData)
}

async function writeReceivedFixturesToFile(token: string, storedExtractedData: { HomeTeam: string; HomeTeamScore: number; AwayTeam: string; AwayTeamScore: number; }[]) {
  const filepath = getFilePath(token);
  using file = await Deno.open(filepath, {write:true, create:true})
  const encoder = new TextEncoder().encode(JSON.stringify(storedExtractedData))
  const writer = file.writable.getWriter()
  await writer.write(encoder)
}

function getFilePath(token: string) {
  const { start, end } = subStringTokenToDirName(token);
  return `./data${token.substring(start, end)}${token.substring(start)}.json`;
}

function subStringTokenToDirName(token: string): { start: number; end: number; } {
  const start = token.indexOf("/");
  const end = token.lastIndexOf("-");
  return { start, end };
}
