import { parseData } from "./helpers/parseData.ts";
import { loggingHandler } from "./helpers/loggingHandler.ts";

// Define a timeout signal for fetch requests, set to 5000 milliseconds (5 seconds).
const SIGNAL: AbortSignal = AbortSignal.timeout(5000);
const HTTP_OK = 200;
const CONTENT_TYPE_JSON = "application/json";

/**
 * Fetches data from a list of URLs concurrently and processes successful responses.
 *
 * This function accepts an array of URLs, performs HTTP GET requests concurrently for each URL,
 * and checks the HTTP response for each fulfilled request. It uses `Promise.allSettled` to ensure 
 * that all requests complete, regardless of whether they succeed or fail.
 *
 * @async
 * @function
 * @param urls - A string of URLs to fetch data from.
 * @returns void Promise - A promise that resolves when all fetch operations are settled.
 * 
 * @throws {Error} If an unexpected error occurs during the fetch process.
 */
export async function fetchDataFromWeb(urls: string): Promise<void> {
  try {
    const fetchPromises: Promise<Response>[] = createFetchPromises(urls)
    const responses: PromiseSettledResult<Response>[] = await Promise.allSettled(fetchPromises);
    handleResponses(responses);
  } catch (err) {
    loggingHandler(`FATAL: unexpected error in fetchDataFromWeb - ${err.message}`);
  }
}

/**
 * Creates an array of fetch promises from the provided URLs.
 *
 * @param urls - A string of URLs to fetch.
 * @returns Promise Response[] An array of promises that represent the fetch requests.
 */
function createFetchPromises(urls: string): Promise<Response>[] {
  return urls.split(" ").map((url) => fetch(url, { signal: SIGNAL }))
}

/**
 * Executes the array of responses from the fetch requests.
 * 
 * @param responses - The results of the fetch requests.
 */
function handleResponses(responses: PromiseSettledResult<Response>[]) {
  for (const response of responses) {
    if (response.status === "fulfilled") {
      checkHttpResponse(response.value);
    }
  }
}

/**
 * Checks the HTTP response for success and validity.
 * 
 * This function verifies the status of an HTTP response. It checks if the 
 * response status is 200 (OK) and whether the content type is JSON. If 
 * the response fails these checks, it logs an error message. Otherwise, 
 * it proceeds to parse the response data.
 * 
 * @param fulfilledResponses - The HTTP response object that has been 
 *                            successfully fetched.
 * @returns A void function; it does not return any value.
 */
function checkHttpResponse(fulfilledResponses: Response): void {
  if (fulfilledResponses.status !== HTTP_OK || !fulfilledResponses.headers.get("content-type")?.includes(CONTENT_TYPE_JSON)) {
    return loggingHandler(`ERROR status(${fulfilledResponses.status}) unable to access: ${fulfilledResponses.url}\n`);
  }
  parseData(fulfilledResponses);
}

fetchDataFromWeb(`${Deno.env.get("FETCH_EPL_2024")}`)