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
  "pythonPath": "",
  "pipSource": [],
  "npmSource": []
}


if (!fs.existsSync(`${os.homedir()}/.uiauto`)) {
  fs.mkdirSync(`${os.homedir()}/.uiauto`)
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

if (!config.hasOwnProperty("pipSource")) {
  config['pipSource'] = default_config.pipSource;
  fs.writeFileSync(configPath, JSON.stringify(config), 'utf8');
}
if (!config.hasOwnProperty("npmSource")) {
  config['npmSource'] = default_config.npmSource;
  fs.writeFileSync(configPath, JSON.stringify(config), 'utf8');
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

  package_source: config.package_source
};
// Export the config object based on the NODE_ENV
// ==============================================

export default _.merge(
  all,
  require('./' + env + '.js') || {});
