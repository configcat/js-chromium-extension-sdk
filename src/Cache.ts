import type { IConfigCatCache } from "configcat-common";

export class LocalStorageCache implements IConfigCatCache {
  async set(key: string, value: string): Promise<void> {
    try {
      await chrome.storage.local.set({ [key]: this.b64EncodeUnicode(value) });
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
        return this.b64DecodeUnicode(configString);
      }
    }
    catch (ex) {
      // chrome storage is unavailable or invalid cache value.
    }
  }

  private b64EncodeUnicode(str: string): string {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (_, p1) {
      return String.fromCharCode(parseInt(p1, 16))
    }));
  }

  private b64DecodeUnicode(str: string): string {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function (c: string) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''));
  }
}
