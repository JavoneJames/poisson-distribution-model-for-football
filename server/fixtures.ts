export async function fetchDataFromWeb(urls: Promise<Response>[]){
  try {
    const responses: PromiseSettledResult<Response>[] = await Promise.allSettled(urls)
    for (const response of responses){
      if(response.status === "rejected")
        cacheRejectedPromises()
      else checkHttpResponse(response.value)
    }
  } catch (_) {
    // ignore
  }
}
//TO-DO store rejected promises then output to log file
function cacheRejectedPromises() {
  throw new Error("Function not implemented.");
}
//TO-DO output non-200 responses to log file
function checkHttpResponse(fulfilledResponses: Response) {
  if(fulfilledResponses.status !== 200 || !fulfilledResponses.headers.get("content-type")?.includes("application/json"))
    cacheRejectedPromises()
  tokenizeData(fulfilledResponses)
}
async function tokenizeData(settledResponses: Response) {
  const token: string = settledResponses.url.substring(settledResponses.url.lastIndexOf(`/`));
  const fixtures: JSON = await settledResponses.json();
  extractRelevantData(token, fixtures)
}
function extractRelevantData(token: string, fixtures: JSON) {
  const storedExtractedData = Object.values(fixtures).filter((fixture) =>{
    return ((fixture.HomeTeamScore && fixture.AwayTeamScore) !== null)
  }).map((fixture)=>{
    return {
      HomeTeam: fixture.HomeTeam,
      HomeTeamScore: fixture.HomeTeamScore, 
      AwayTeam: fixture.AwayTeam, 
      AwayTeamScore: fixture.AwayTeamScore
    }
  })
  writeReceivedFixturesToFile(token, storedExtractedData)
}
//TO-DO implement func that handles writing extract data to file
function writeReceivedFixturesToFile(token: string, storedExtractedData: { HomeTeam: any; HomeTeamScore: any; AwayTeam: any; AwayTeamScore: any; }[]) {
  throw new Error("Function not implemented.");
}
