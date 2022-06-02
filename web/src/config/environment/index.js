'use strict'
var path = window.nodeRequire('path')
var _ = require('lodash')
var env = process.env.NODE_ENV || 'development'

const os = window.nodeRequire('os')
const fse = window.nodeRequire('fs-extra')
const fs = window.nodeRequire('fs')
const configPath = path.normalize(`${os.homedir()}/.uiauto/uiauto.conf`)
let config = JSON.parse(fs.readFileSync(configPath).toString());

// All configurations will extend these options
// ============================================
var all = {

  python: 'python',

  env: env,

  appName: 'UiAuto',

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // Should we populate the DB with sample data?
  seedDB: true,

  pluginsPath: config.pluginsPath,

  projectsPath: config.projectsPath,

  storePath: config.storePath,

  pythonPath: config.pythonPath,

  serverUrl: config.serverUrl || '',

  package_source: config.package_source,

  isOpenAtLogin: config.hasOwnProperty('isOpenAtLogin') ? config.isOpenAtLogin : true
}
// Export the config object based on the NODE_ENV
// ==============================================

export default _.merge(
  all,
  require('./' + env + '.js') || {})
