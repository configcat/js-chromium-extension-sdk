import { ICache, ProjectConfig } from "configcat-common";

export class LocalStorageCache implements ICache {
    cache: { [key: string]: ProjectConfig } = {};

    set(key: string, config: ProjectConfig): Promise<void> | void {
        this.cache[key] = config;
        const obj = {};
        obj[key] = btoa(JSON.stringify(config));
        return new Promise(resolve => {
            try {
                chrome.storage.local.set(obj).then(() => {
                    resolve();
                });
            } catch (ex) {
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
                        if (config) {
                            this.cache[key] = config;
                            resolve(config);
                            return;
                        }
                    }
                    resolve(null);
                });
            } catch (ex) {
                // chrome storage is unavailable or invalid cache value.
                resolve(null);
            }
        });

    }
}
