import { IConfigFetcher, OptionsBase, FetchResult } from "configcat-common";

export class HttpConfigFetcher implements IConfigFetcher {
    fetchLogic(options: OptionsBase, lastEtag: string, callback: (result: FetchResult) => void): void {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.requestTimeoutMs);

        fetch(options.getUrl(), {
            method: "GET",
            signal: controller.signal
        }).then(async (response) => {
            if (response.status === 200) {
                const text = await response.text();
                const etag = response.headers && response.headers.get("Etag");
                clearTimeout(timeoutId);
                callback(FetchResult.success(text, etag ?? ""));
            } else if (response.status === 304) {
                clearTimeout(timeoutId);
                callback(FetchResult.notModified());
            } else {
                options.logger.error(
                    `Failed to download feature flags & settings from ConfigCat. ${response.status} - ${response.statusText}`,
                );
                clearTimeout(timeoutId);
                callback(FetchResult.error());
            }
        }).catch((error) => {
            options.logger.error(`Failed to download feature flags & settings from ConfigCat. Error: ${error}`);
            clearTimeout(timeoutId);
            callback(FetchResult.error());
        });
    }
}
