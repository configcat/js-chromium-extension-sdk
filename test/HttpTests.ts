import { assert } from "chai";
import fetchMock from "fetch-mock";
import { LogLevel } from "../src/index";
import { FakeLogger } from "./helpers/fakes";
import * as utils from "./helpers/utils";

describe("HTTP tests", () => {
  const sdkKey = "PKDVCLf-Hq-h-kCzMp-L7Q/psuH7BGHoUmdONrzzUOY7A";
  const baseUrl = "https://cdn-global.test.com";

  if (typeof AbortController !== "undefined") {
    it("HTTP timeout", async () => {
      const requestTimeoutMs = 1500;

      fetchMock.get(url => url.startsWith(baseUrl),
        new Promise(resolve => setTimeout(() => resolve({ throws: new Error("Test failed.") }), requestTimeoutMs * 2)));

      try {
        const logger = new FakeLogger();

        const client = utils.createClientWithManualPoll(sdkKey, {
          requestTimeoutMs,
          baseUrl,
          logger
        });
        const startTime = new Date().getTime();
        await client.forceRefreshAsync();
        const duration = new Date().getTime() - startTime;
        assert.isTrue(duration > 1000 && duration < 2000);

        const defaultValue = "NOT_CAT";
        assert.strictEqual(defaultValue, await client.getValueAsync("stringDefaultCat", defaultValue));

        assert.isDefined(logger.events.find(([level, , msg]) => level === LogLevel.Error && msg.toString().startsWith("Request timed out while trying to fetch config JSON.")));
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

      const client = utils.createClientWithManualPoll(sdkKey, {
        requestTimeoutMs: 1000,
        baseUrl,
        logger
      });

      await client.forceRefreshAsync();

      const defaultValue = "NOT_CAT";
      assert.strictEqual(defaultValue, await client.getValueAsync("stringDefaultCat", defaultValue));

      assert.isDefined(logger.events.find(([level, , msg]) => level === LogLevel.Error && msg.toString().startsWith("Your SDK Key seems to be wrong.")));
    }
    finally {
      fetchMock.reset();
    }
  });

  it("Unexpected status code", async () => {
    fetchMock.get(url => url.startsWith(baseUrl), 502);

    try {
      const logger = new FakeLogger();

      const client = utils.createClientWithManualPoll(sdkKey, {
        requestTimeoutMs: 1000,
        baseUrl,
        logger
      });

      await client.forceRefreshAsync();

      const defaultValue = "NOT_CAT";
      assert.strictEqual(defaultValue, await client.getValueAsync("stringDefaultCat", defaultValue));

      assert.isDefined(logger.events.find(([level, , msg]) => level === LogLevel.Error && msg.toString().startsWith("Unexpected HTTP response was received while trying to fetch config JSON:")));
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

      const client = utils.createClientWithManualPoll(sdkKey, {
        requestTimeoutMs: 1000,
        baseUrl,
        logger
      });

      await client.forceRefreshAsync();

      const defaultValue = "NOT_CAT";
      assert.strictEqual(defaultValue, await client.getValueAsync("stringDefaultCat", defaultValue));

      assert.isDefined(logger.events.find(([level, , msg]) => level === LogLevel.Error && msg.toString().startsWith("Unexpected error occurred while trying to fetch config JSON.")));
    }
    finally {
      fetchMock.reset();
    }
  });
});
