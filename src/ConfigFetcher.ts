import { IConfigFetcher, OptionsBase, FetchError, IFetchResponse } from "configcat-common";

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
      // NOTE: It's intentional that we don't specify the If-None-Match header.
      // The browser automatically handles it, adding it manually would cause an unnecessary CORS OPTIONS request.
      const response = await fetch(options.getUrl(), requestInit);

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
