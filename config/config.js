(function (global) {
  'use strict';

  /*
   * Central backend configuration.
   *
   * Local development:
   *   http://localhost:5000
   *
   * Production:
   *   Change this value to the real URL where your Node.js backend
   *   is running.
   */

  const BACKEND_BASE_URL = 'https://api.cocoabridge.com';

  global.AppBackend = global.AppBackend || {};

  global.AppBackend.config = {
    baseUrl: BACKEND_BASE_URL,
    apiPrefix: '/api'
  };
})(window);



