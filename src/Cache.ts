import type { IConfigCatCache } from "configcat-common";

export class LocalStorageCache implements IConfigCatCache {
  async set(key: string, value: string): Promise<void> {
    try {
      await chrome.storage.local.set({ [key]: toUtf8Base64(value) });
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
        return fromUtf8Base64(configString);
      }
    }
    catch (ex) {
      // chrome storage is unavailable or invalid cache value.
    }
  }
}

export function toUtf8Base64(str: string): string {
  str = encodeURIComponent(str);
  str = str.replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16)));
  return btoa(str);
}

export function fromUtf8Base64(str: string): string {
  str = atob(str);
  str = str.replace(/[%\x80-\xFF]/g, m => "%" + m.charCodeAt(0).toString(16));
  return decodeURIComponent(str);
}
