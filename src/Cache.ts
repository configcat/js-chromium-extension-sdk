import type { IConfigCatCache } from "configcat-common";

export class LocalStorageCache implements IConfigCatCache {
  async set(key: string, value: string): Promise<void> {
    try {
      await chrome.storage.local.set({ [key]: btoa(value) });
    }
    catch (ex) {
      // chrome storage is unavailable
    }
  }

  async get(key: string): Promise<string | undefined> {
    try {
      const cacheObj = await chrome.storage.local.get(key);
      const configString = cacheObj[key];
      if (configString) {
        return atob(configString);
      }
    }
    catch (ex) {
      // chrome storage is unavailable or invalid cache value.
    }
  }
}
