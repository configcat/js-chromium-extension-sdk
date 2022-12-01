# ConfigCat SDK for Chrome Extensions [Beta]
https://configcat.com

ConfigCat SDK for Chrome extensions provides easy integration with ConfigCat feature flags.

ConfigCat is a feature flag and configuration management service that lets you separate releases from deployments. You can turn your features ON/OFF using <a href="https://app.configcat.com" target="_blank">ConfigCat Dashboard</a> even after they are deployed. ConfigCat lets you target specific groups of users based on region, email or any other custom user attribute.

ConfigCat is a <a href="https://configcat.com" target="_blank">hosted feature flag service</a>. Manage feature toggles across frontend, backend, mobile, desktop apps. <a href="https://configcat.com" target="_blank">Alternative to LaunchDarkly</a>. Management app + feature flag SDKs.

[![JS-CHROMIUM CI](https://github.com/configcat/js-chromium-extension-sdk/actions/workflows/js-chromium-ci.yml/badge.svg?branch=master)](https://github.com/configcat/js-chromium-extension-sdk/actions/workflows/js-chromium-ci.yml) 
[![Known Vulnerabilities](https://snyk.io/test/github/configcat/js-chromium-extension-sdk/badge.svg?targetFile=package.json)](https://snyk.io/test/github/configcat/js-chromium-extension-sdk?targetFile=package.json) 
![License](https://img.shields.io/github/license/configcat/js-chromium-extension-sdk.svg) 
[![](https://data.jsdelivr.com/v1/package/npm/configcat-js-chromium-extension/badge)](https://www.jsdelivr.com/package/npm/configcat-js-chromium-extension)
[![NPM](https://nodei.co/npm/configcat-js-chromium-extension.png)](https://nodei.co/npm/configcat-js-chromium-extension/)

## Getting Started

### 1. Install and import package:

*via NPM [package](https://npmjs.com/package/configcat-js-chromium-extension):*
```PowerShell
npm i configcat-js-chromium-extension
```
```js
import * as configcat from "configcat-js-chromium-extension";
```

### 2. Go to the <a href="https://app.configcat.com/sdkkey" target="_blank">ConfigCat Dashboard</a> to get your *SDK Key*:
![SDK-KEY](https://raw.githubusercontent.com/ConfigCat/js-chromium-extension-sdk/master/media/readme02-3.png  "SDK-KEY")

### 3. Create a *ConfigCat* client instance:
```js
var configCatClient = configcat.createClient("#YOUR-SDK-KEY#");
```
> We strongly recommend using the *ConfigCat Client* as a Singleton object in your application.

### 4. Get your setting value:
The Promise (async/await) way:
```js
configCatClient.getValueAsync("isMyAwesomeFeatureEnabled", false)
.then((value) => {
    if(value) {
        do_the_new_thing();
    } else {
        do_the_old_thing();
    }
});
```
or the Callback way:
```js
configCatClient.getValue("isMyAwesomeFeatureEnabled", false, (value) => {
    if(value) {
        do_the_new_thing();
    } else {
        do_the_old_thing();
    }
});
```

### Permissions
The SDK uses the [Storage API](https://developer.chrome.com/docs/extensions/reference/storage/) to store cached content. To let it use the API declare the `storage` permission in your `manifest.json`.

```json
"permissions": [
    "storage"
],
```

## Getting user specific setting values with Targeting
Using this feature, you will be able to get different setting values for different users in your application by passing a `User Object` to `getValue()` or `getValueAsync()`.

Read more about [Targeting here](https://configcat.com/docs/advanced/targeting/).
```js
const userObject = { identifier : "#USER-IDENTIFIER#" };
configCatClient.getValueAsync("isMyAwesomeFeatureEnabled", false, userObject)
.then((value) => {
    if(value) {
        do_the_new_thing();
    } else {
        do_the_old_thing();
    }
});
```

## Sample/Demo apps
  - [Chrome Extension](https://github.com/configcat/js-chromium-extension-sdk/tree/master/samples/chrome-extension)

## Polling Modes
The ConfigCat SDK supports 3 different polling mechanisms to acquire the setting values from ConfigCat. After latest setting values are downloaded, they are stored in the internal cache then all requests are served from there. Read more about Polling Modes and how to use them at [ConfigCat Docs](https://configcat.com/docs/sdk-reference/js/#polling-modes).

## Sensitive information handling

The frontend/mobile SDKs are running in your users' browsers/devices. The SDK is downloading a [config.json](https://configcat.com/docs/requests/) file from ConfigCat's CDN servers. The URL path for this config.json file contains your SDK key, so the SDK key and the content of your config.json file (feature flag keys, feature flag values, targeting rules, % rules) can be visible to your users. 
This SDK key is read-only, it only allows downloading your config.json file, but nobody can make any changes with it in your ConfigCat account.  
Suppose you don't want your SDK key or the content of your config.json file visible to your users. In that case, we recommend you use the SDK only in your backend applications and call a backend endpoint in your frontend/mobile application to evaluate the feature flags for a specific application customer.  
Also, we recommend using [sensitive targeting comparators](https://configcat.com/docs/advanced/targeting/#sensitive-text-comparators) in the targeting rules of those feature flags that are used in the frontend/mobile SDKs.

## Browser compatibility
This SDK should be compatible with all modern browsers.

The SDK is [tested](https://github.com/configcat/js-chromium-extension-sdk/blob/master/.github/workflows/js-chromium-ci.yml) against the following browsers:
- Chrome (stable, latest, beta)
- Chromium (72.0.3626.0, 80.0.3987.0)

These tests are running on each pull request, before each deploy, and on a daily basis. 
You can view a sample run [here](https://github.com/configcat/js-chromium-extension-sdk/actions/runs/3583606237).

## Need help?
https://configcat.com/support

## Contributing
Contributions are welcome.

## About ConfigCat
- [Official ConfigCat SDK's for other platforms](https://github.com/configcat)
- [Documentation](https://configcat.com/docs)
- [Blog](https://blog.configcat.com)

# Troubleshooting
### Make sure you have the proper Node.js version installed
You might run into errors caused by the wrong version of Node.js. To make sure you are using the recommended Node.js version follow these steps.

1. Have nvm (Node Version Manager - https://github.com/nvm-sh/nvm ) installed:
1. Run `nvm install`. This will install the compatible version of Node.js.
1. Run `nvm use`. This will use the compatible version of Node.js.