import { ICache, ProjectConfig } from "configcat-common";

export class LocalStorageCache implements ICache {
    cache: { [key: string]: ProjectConfig } = {};

    set(key: string, config: ProjectConfig): Promise<void> | void {
        this.cache[key] = config;
        const obj = {};
        obj[key] = btoa(JSON.stringify(config));
        try {
            chrome.storage.local.set(obj);
        } catch (ex) {
            // chrome storage is unavailable
        }
    }

    get(key: string): Promise<ProjectConfig | null> | ProjectConfig | null {
        const config: ProjectConfig = this.cache[key];
        if (config) {
            return config;
        }

        try {
            chrome.storage.local.get(key, (res) => {
                const configString: string = res[key];
                if (configString) {
                    const config: ProjectConfig = JSON.parse(atob(configString));
                    if (config) {
                        this.cache[key] = config;
                        return config;
                    }
                }
            });
        } catch (ex) {
            // chrome storage is unavailable or invalid cache value.
        }

        return null;
    }
}
