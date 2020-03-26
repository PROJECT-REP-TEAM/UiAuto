'use strict';

// Development specific configuration
// ==================================
module.exports = {

  python: "python3",

  // serverUrl: 'http://localhost:4399',
  // serverUrl: 'http://spider-man.fun:3019',
  //serverUrl: 'http://uiauto.easyup.cn:3000',

  version: "20191218103700",

  express: {
    domain: "0.0.0.0",
    port: 3000
  },
  socket: {
    domain: "rpa-api.legion-tech.net",
    port: 3019
    // domain: "http://192.168.1.116",
    // port: 3018
  }

};
