import { assert } from "chai";
import { LocalStorageCache } from "../lib/Cache";
import { resolve } from "path";

let localStorage = {}

global.chrome = <any>{
    storage: {
        local: {
            clear: () => {
                localStorage = {}
            },
            set: (toMergeIntoStorage: any) => {
                localStorage = { ...localStorage, ...toMergeIntoStorage }
            },
            get: () => {
                return localStorage;
            }
        },
    }
}

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
