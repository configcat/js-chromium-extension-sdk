'use strict';

import { LogLevel, User } from 'configcat-common';
import * as configcat from 'configcat-js-chromium-extension'

(function () {
  // Setting log level Info to show detailed feature flag evaluation
  const logger = configcat.createConsoleLogger(LogLevel.Info);

  // You can instantiate the client with different polling modes. See the Docs: https://configcat.com/docs/sdk-reference/js/#polling-modes
  const configCatClient = configcat.createClientWithAutoPoll('PKDVCLf-Hq-h-kCzMp-L7Q/HhOWfwVtZ0mb30i9wi17GQ', {
    pollIntervalSeconds: 2,
    logger: logger
  });

  function init() {
    document.getElementById('checkAwesome').addEventListener('click', () => {
      configCatClient.getValue("isAwesomeFeatureEnabled", false, function (value) {
        document.getElementById('isAwesomeEnabled').innerHTML = value;
      });
    });

    document.getElementById('checkProofOfConcept').addEventListener('click', () => {
      const userEmail =  document.getElementById('userEmail').value;
      const userObject = new User('#SOME-USER-ID#', userEmail);

      configCatClient.getValue("isPOCFeatureEnabled", false, function (value) {
        document.getElementById('isPOCEnabled').innerHTML = value;
      }, userObject);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
