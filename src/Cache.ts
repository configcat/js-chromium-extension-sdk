import type { ICache } from "configcat-common";
import { ProjectConfig } from "configcat-common";

export class LocalStorageCache implements ICache {
  cache: { [key: string]: ProjectConfig } = {};

  set(key: string, config: ProjectConfig): Promise<void> | void {
    this.cache[key] = config;
    const obj: any = {};
    obj[key] = btoa(JSON.stringify(config));
    return new Promise(resolve => {
      try {
        chrome.storage.local.set(obj).then(() => {
          resolve();
        });
      }
      catch (ex) {
        // chrome storage is unavailable
        resolve();
      }
    });
  }

  get(key: string): Promise<ProjectConfig | null> | ProjectConfig | null {
    const config: ProjectConfig = this.cache[key];
    if (config) {
      return config;
    }
    return new Promise(resolve => {
      try {
        chrome.storage.local.get(key, (res) => {
          const configString: string = res[key];
          if (configString) {
            const config: ProjectConfig = JSON.parse(atob(configString));
            // JSON.parse creates a plain object instance, so we need to manually restore the prototype
            // (so we don't run into "... is not a function" errors).
            (Object.setPrototypeOf || ((o, proto) => o["__proto__"] = proto))(config, ProjectConfig.prototype);

            if (config) {
              this.cache[key] = config;
              resolve(config);
              return;
            }
          }
          resolve(null);
        });
      }
      catch (ex) {
        // chrome storage is unavailable or invalid cache value.
        resolve(null);
      }
    });
  }
}
