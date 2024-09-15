import { parseData } from "./helpers/parseData.ts";
import { loggingHandler } from "./helpers/loggingHandler.ts";

// Define a timeout signal for fetch requests, set to 5000 milliseconds (5 seconds).
const SIGNAL: AbortSignal = AbortSignal.timeout(5000);

/**
 * Fetches data from an array of URLs concurrently.
 * 
 * This asynchronous function takes an array of URL strings and attempts to 
 * fetch data from each URL. It uses the AbortSignal to cancel requests 
 * that take longer than the specified timeout. The function processes 
 * the responses, checking each for success or failure.
 * 
 * @param urls - An array of strings representing the URLs to fetch data from.
 * @returns A Promise that resolves when all fetch requests have completed, 
 *          whether successfully or not.
 * @throws Will log an error message if an unexpected error occurs during 
 *         the fetching process.
 */
export async function fetchDataFromWeb(urls: string[]): Promise<void> {
  try {
    // Map each URL to a fetch promise, applying the timeout signal.
    const fetchPromises = urls.map((url) => fetch(url, { signal: SIGNAL }));
    // Wait for all fetch promises to settle (fulfill or reject).
    const responses: PromiseSettledResult<Response>[] = await Promise.allSettled(fetchPromises);
    for (const response of responses) {
      // Check if the response was successful and handle it accordingly.
      if (response.status === "fulfilled") {
        checkHttpResponse(response.value);
      }
    }
  } catch (err) {
    // Log any unexpected errors that occur during the fetch process.
    loggingHandler(`FATAL: unexpected error in fetchDataFromWeb - ${err.message}`);
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
  if (fulfilledResponses.status !== 200 || !fulfilledResponses.headers.get("content-type")?.includes("application/json")) {
    return loggingHandler(`ERROR status(${fulfilledResponses.status}) unable to access: ${fulfilledResponses.url}\n`);
  }
  // If the response is valid, proceed to parse the data.
  parseData(fulfilledResponses);
}

fetchDataFromWeb([
  `${Deno.env.get("FETCH_EPL_2024")}`
])