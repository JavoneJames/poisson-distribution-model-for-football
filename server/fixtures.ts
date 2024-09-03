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
function checkHttpResponse(value: Response) {
  throw new Error("Function not implemented.");
}
