import Vue from 'vue'

const client = require('./client')
client.init();

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
import axios from 'axios'

const path = window.nodeRequire('path')
const os = window.nodeRequire('os')

// const fse = window.nodeRequire('fs-extra')
const fs = window.nodeRequire('fs')
const {
  destroyTray
} = require("./client/index");

// add font awwsome icon support
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(fas, fab, far)
Vue.component('font-awesome-icon', FontAwesomeIcon)

const { app } = window.nodeRequire('@electron/remote');

if (os.platform() == 'darwin' && path.resolve() == "/") {
  window["executor"] = window.nodeRequire(path.normalize(app.getPath("exe") + '../../../public/base_integration/uiauto_executor/executor.js'))
} else {
  window["executor"] = window.nodeRequire(`${path.resolve()}/public/base_integration/uiauto_executor/executor`)
}

if (os.platform() === 'win32') {
  window['uiselector'] = window.nodeRequire(`${path.resolve()}/public/base_integration/uiauto_uiselector/index`)
  window['uiselector'].start_process()
} else if (os.platform() === 'linux') {
  window['uiselector'] = window.nodeRequire(`${path.resolve()}/public/base_integration/uiauto_uiselector_ukylin/index`)
  window['uiselector'].start_process()
}

window['py_shell'] = window["executor"].start();
// const cron = require('./express/cron')
const schedule = require('./schedule')
const { sequelize } = require('./express/database')


// 离开程序关闭进程（如检查更新）
window.onbeforeunload = function (event) {
  destroyTray()
  if (window['js_shell']) {
    window['js_shell'].kill();
  }
  window['py_shell'].terminate();
  window['uiselector'].exit_uiselector();
};

// import VueI18n from 'vue-i18n'

import '@/icons' // icon
import '@/assets/iconfont/iconfont.css' // 第三方icon
import '@/permission' // permission control
// import VueDND from 'awe-dnd'
import _ from 'lodash'
Vue.prototype._ = _
import RouterLinkGroup from '@/components/RouterLinkGroup'

// Vue.use(VueDND)
/**
 * If you don't want to use mock-server
 * you want to use mockjs for request interception
 * you can execute:
 *
 * import { mockXHR } from '../mock'
 * mockXHR()
 */

// set ElementUI lang to EN
Vue.use(ElementUI, { locale })
Vue.component('router-link-group', RouterLinkGroup)

// Vue.use(VueI18n)
// const i18n = new VueI18n({
//   // locale: LangStorage.getLang('zh'),  // 语言标识，后面会用做切换和将用户习惯存储到本地浏览器
//   locale: 'zh', // 语言标识
//   messages: {
//     'zh-CN': require('./common/lang/zh'), // 中文语言包
//     'en-US': require('./common/lang/en') // 英文语言包
//   }
// })
// axios.defaults.adapter = require('axios/lib/adapters/http');

Vue.prototype.$axios = axios

Vue.config.productionTip = false

new Vue({
  el: '#app',
  // i18n,
  router,
  store,
  render: h => h(App)
})

const { shell } = window.nodeRequire('@electron/remote')
window.openDir = (path) => {
  let _path = path;
  if (os.platform() == 'win32') {
    _path = path.replace(/\//g, "\\")
  }
  shell.showItemInFolder(_path)
}

if (!fs.existsSync(path.normalize(`${os.homedir()}/logs`))) {
  fs.mkdirSync(path.normalize(`${os.homedir()}/logs`))
}

sequelize.sync()
  .then(() => {
    console.info('sqlite database 初始化完成')
  })
  .catch((error) => {
    console.error('sqlite database初始化出错：', error)
  })
// 启动本地cron
// cron.start()

schedule.init()

