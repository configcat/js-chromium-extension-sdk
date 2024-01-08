import type { IConfigFetcher, IFetchResponse, OptionsBase } from "configcat-common";
import { FetchError } from "configcat-common";

export class HttpConfigFetcher implements IConfigFetcher {
  async fetchLogic(options: OptionsBase, lastEtag: string | null): Promise<IFetchResponse> {
    const requestInit: RequestInit = { method: "GET" };
    let cleanup: () => void;

    // NOTE: Older Chromium versions (e.g. the one used in our tests) may not support AbortController.
    if (typeof AbortController !== "undefined") {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.requestTimeoutMs);
      requestInit.signal = controller.signal;
      cleanup = () => clearTimeout(timeoutId);
    }
    else {
      cleanup = () => { };
    }

    try {
      let url = options.getUrl();
      if (lastEtag) {
        // We are sending the etag as a query parameter so if the browser doesn't automatically adds the If-None-Match header, we can transform this query param to the header in our CDN provider.
        url += "&ccetag=" + encodeURIComponent(lastEtag);
      }
      // NOTE: It's intentional that we don't specify the If-None-Match header.
      // The browser automatically handles it, adding it manually would cause an unnecessary CORS OPTIONS request.
      // In case the browser doesn't handle it, we are transforming the ccetag query parameter to the If-None-Match header 
      const response = await fetch(url, requestInit);

      const { status: statusCode, statusText: reasonPhrase } = response;
      if (statusCode === 200) {
        const body = await response.text();
        const eTag = response.headers?.get("Etag") ?? void 0;
        return { statusCode, reasonPhrase, eTag, body };
      }
      else {
        return { statusCode, reasonPhrase };
      }
    }
    catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        if (requestInit.signal?.aborted) {
          throw new FetchError("timeout", options.requestTimeoutMs);
        }
        else {
          throw new FetchError("abort");
        }
      }

      throw new FetchError("failure", err);
    }
    finally {
      cleanup();
    }
  }
}
