// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


// const electron = require('electron');
// window.electron = electron;
console.log("=====================renderer=========================");
const electron = window.nodeRequire('electron');
console.log(electron)