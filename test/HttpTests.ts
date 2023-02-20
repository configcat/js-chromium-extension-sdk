import { assert } from "chai";
import * as configcatClient from "../src/index";
import fetchMock from 'fetch-mock';
import { FakeLogger } from "./helpers/fakes";
import { LogLevel } from "../src/index";

describe("HTTP tests", () => {
    const sdkKey: string = "PKDVCLf-Hq-h-kCzMp-L7Q/psuH7BGHoUmdONrzzUOY7A";
    const baseUrl = "https://cdn-global.test.com";

    if (typeof AbortController !== "undefined") {
      it("HTTP timeout", async () => {
        const requestTimeoutMs = 1500;
  
        fetchMock.get(url => url.startsWith(baseUrl),
          new Promise(resolve => setTimeout(() => resolve({ throws: new Error("Test failed.") }), requestTimeoutMs * 2)));
  
        try {
          const logger = new FakeLogger();
  
          const client = configcatClient.createClientWithManualPoll(sdkKey, {
            requestTimeoutMs,
            baseUrl,
            logger
          });
          const startTime = new Date().getTime();
          await client.forceRefreshAsync();
          const duration = new Date().getTime() - startTime;
          assert.isTrue(duration > 1000 && duration < 2000);
  
          const defaultValue = "NOT_CAT"
          assert.strictEqual(defaultValue, await client.getValueAsync("stringDefaultCat", defaultValue));
    
          assert.isDefined(logger.messages.find(([level, msg]) => level == LogLevel.Error && msg.startsWith("Request timed out.")));
        }
        finally {
          fetchMock.reset();
        }
      }); 
    }

    it("404 Not found", async () => {
      fetchMock.get(url => url.startsWith(baseUrl), 404);

      try {
        const logger = new FakeLogger();

        const client = configcatClient.createClientWithManualPoll(sdkKey, {
          requestTimeoutMs: 1000,
          baseUrl,
          logger
        });

        await client.forceRefreshAsync();

        const defaultValue = "NOT_CAT"
        assert.strictEqual(defaultValue, await client.getValueAsync("stringDefaultCat", defaultValue));

        assert.isDefined(logger.messages.find(([level, msg]) => level == LogLevel.Error && msg.startsWith("Double-check your SDK Key")));
      }
      finally {
        fetchMock.reset();
      }
    });
    
    it("Unexpected status code", async () => {
      fetchMock.get(url => url.startsWith(baseUrl), 502);

      try {
        const logger = new FakeLogger();

        const client = configcatClient.createClientWithManualPoll(sdkKey, {
          requestTimeoutMs: 1000,
          baseUrl,
          logger
        });

        await client.forceRefreshAsync();

        const defaultValue = "NOT_CAT"
        assert.strictEqual(defaultValue, await client.getValueAsync("stringDefaultCat", defaultValue));

        assert.isDefined(logger.messages.find(([level, msg]) => level == LogLevel.Error && msg.startsWith("Unexpected HTTP response was received:")));
      }
      finally {
        fetchMock.reset();
      }
    });

    it("Unexpected error", async () => {
      fetchMock.get(url => url.startsWith(baseUrl),
        { throws: new Error("Connection error.") });

      try {
        const logger = new FakeLogger();

        const client = configcatClient.createClientWithManualPoll(sdkKey, {
          requestTimeoutMs: 1000,
          baseUrl,
          logger
        });
  
        await client.forceRefreshAsync();
  
        const defaultValue = "NOT_CAT"
        assert.strictEqual(defaultValue, await client.getValueAsync("stringDefaultCat", defaultValue));
  
        console.log(logger.messages);

        assert.isDefined(logger.messages.find(([level, msg]) => level == LogLevel.Error && msg.startsWith("Request failed due to a network or protocol error.")));
      }
      finally {
        fetchMock.reset();
      }
    });
});
