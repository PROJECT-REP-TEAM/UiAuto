'use strict';
var path = window.require('path');
var _ = require('lodash');
var env = process.env.NODE_ENV || 'development';

const os = window.require('os');
const fse = window.require('fs-extra');
const fs = window.require('fs');

const configPath = `${os.homedir()}/.uiauto/uiauto.conf`;
const default_config = {
  "pluginsPath": path.normalize('C:\\UiAuto_files\\plugins'), // `${os.homedir()}\\.uiauto\\plugins`,
  "projectsPath": path.normalize('C:\\UiAuto_files\\projects'),// `${os.homedir()}\\.uiauto\\projects`,
  "serverUrl": "http://rpa-api.legion-tech.net",
  "pythonPath": ""
}

var config = default_config;
if (!fs.existsSync(configPath)) {
  fse.outputFileSync(configPath, JSON.stringify(default_config, null, "\t"), 'utf8');
}

try {
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  console.log('read success');
} catch (err) {
  fs.writeFileSync(configPath, JSON.stringify(default_config), 'utf8');
  console.log('create success');
}

if (!fs.existsSync(path.resolve('C:\\UiAuto_files'))) {
  fs.mkdirSync(path.resolve('C:\\UiAuto_files'))
}

if (!fs.existsSync(config.pluginsPath)) {
  fs.mkdirSync(config.pluginsPath);
}

if (!fs.existsSync(config.projectsPath)) {
  fs.mkdirSync(config.projectsPath);
}

// All configurations will extend these options
// ============================================
var all = {

  python: "python",

  env: env,

  appName: "UiAuto",

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // Should we populate the DB with sample data?
  seedDB: true,

  pluginsPath: config.pluginsPath,

  projectsPath: config.projectsPath,

  pythonPath: config.pythonPath,

  serverUrl: config.serverUrl || "",
};
// Export the config object based on the NODE_ENV
// ==============================================

export default _.merge(
  all,
  require('./' + env + '.js') || {});
