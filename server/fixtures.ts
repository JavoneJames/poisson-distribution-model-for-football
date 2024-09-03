async function fetchDataFromWeb(urls: Promise<Response>[]){
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

//TO-DO check http response for fetch request
function checkHttpResponse(fulfilledResponses: Response) {
  if(fulfilledResponses.status !== 200|| !fulfilledResponses.headers.get("content-type")?.includes("application/json"))
    cacheRejectedPromises()
  tokenizeData(fulfilledResponses)
}
//TO-DO extract 'token' get the league and parse response body body text into json
function tokenizeData(fulfilledResponses: Response) {
  throw new Error("Function not implemented.");
}
