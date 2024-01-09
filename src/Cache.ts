import type { IConfigCatCache, IConfigCatKernel } from "configcat-common";
import { ExternalConfigCache } from "configcat-common";

export class LocalStorageCache implements IConfigCatCache {
  static setup(kernel: IConfigCatKernel, localStorageGetter?: () => chrome.storage.LocalStorageArea | null): IConfigCatKernel {
    const localStorage = localStorageGetter?.() ?? window.chrome?.storage?.local;
    if (localStorage) {
      kernel.defaultCacheFactory = options => new ExternalConfigCache(new LocalStorageCache(localStorage), options.logger);
    }
    return kernel;
  }

  constructor(private readonly storage: chrome.storage.LocalStorageArea) {
  }

  async set(key: string, value: string): Promise<void> {
    await this.storage.set({ [key]: toUtf8Base64(value) });
  }

  async get(key: string): Promise<string | undefined> {
    const cacheObj = await this.storage.get(key);
    const configString = cacheObj[key];
    if (configString) {
      return fromUtf8Base64(configString);
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
