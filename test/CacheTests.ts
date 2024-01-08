import { assert } from "chai";
import { LocalStorageCache, fromUtf8Base64, toUtf8Base64 } from "../src/Cache";

describe("Base64 encode/decode test", () => {
  let allBmpChars = "";
  for (let i = 0; i <= 0xFFFF; i++) {
    if (i < 0xD800 || 0xDFFF < i) { // skip lone surrogate chars
      allBmpChars += String.fromCharCode(i);
    }
  }

  for (const input of [
    "",
    "\n",
    "äöüÄÖÜçéèñışğâ¢™✓😀",
    allBmpChars
  ]) {
    it(`Base64 encode/decode works - input: ${input.slice(0, Math.min(input.length, 128))}`, () => {
      assert.strictEqual(fromUtf8Base64(toUtf8Base64(input)), input);
    });
  }
});

let localStorage = {};

global.chrome = <any>{
  storage: {
    local: {
      clear: () => {
        localStorage = {};
      },
      set: (toMergeIntoStorage: any) => {
        localStorage = { ...localStorage, ...toMergeIntoStorage };
      },
      get: () => {
        return localStorage;
      }
    },
  }
};

describe("LocalStorageCache cache tests", () => {
  it("LocalStorageCache works with non latin 1 characters", async () => {
    const cache = new LocalStorageCache();
    const key = "testkey";
    const text = "äöüÄÖÜçéèñışğâ¢™✓😀";
    await cache.set(key, text);
    const retrievedValue = await cache.get(key);
    assert.strictEqual(retrievedValue, text);
  });
});
