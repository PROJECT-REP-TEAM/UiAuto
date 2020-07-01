import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
import axios from 'axios'

const os = window.require('os')
const path = window.require('path')
const pyutil = window.require(path.resolve() + '/public/utils/pyutil')

const fse = window.require('fs-extra')
const fs = window.require('fs')
const child_process = window.require('child_process')
const https = window.require('https')
const configPath = `${os.homedir()}/.uiauto/uiauto.conf`

const npm = window.require('npm');
const {machineIdSync} = window.require('node-machine-id');
const decompress = window.require("decompress");
window['executor'] = window.require(`${path.resolve()}/public/base_integration/uiauto_executor/executor`);
window['uiselector'] = window.require(`${path.resolve()}/public/base_integration/uiauto_uiselector/index`);

window['py_shell'] = executor.start();
window['uiselector'].start_process();


// import VueI18n from 'vue-i18n'

import '@/icons' // icon
import '@/assets/iconfont/iconfont.css' // 第三方icon
import '@/permission' // permission control
// import VueDND from 'awe-dnd'
import * as _ from 'lodash'
import RouterLinkGroup from "@/components/RouterLinkGroup"

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
Vue.component("router-link-group", RouterLinkGroup)

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

// 检测chromedriver版本是否与chrome版本相符
const checkChromeDriver = async () => {
  try {
    let shell_result = child_process.execSync('REG QUERY "HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Google Chrome" /v version')
    shell_result = shell_result.toString('UTF-8')

    shell_result = shell_result.split('    ')

    let version = shell_result[shell_result.length - 1].split('.')
    version = _.slice(version, 0, version.length - 1).join('.')
    console.log('version>>>>>>>>>>>>>', version)

    const currentChromeDriverVersion = getCurrentChromeDriverVersion()
    console.log('currentChromeDriverVersion>>>>>>>>>>>>>>>', currentChromeDriverVersion)

    if (currentChromeDriverVersion.indexOf(version) === -1) {
      console.log('chromedirver 版本不适配')

      const latest_release_version = await get_latest_release_version(version)
      console.log('latest_release_version>>>>>>', latest_release_version)

      await downloadChromeDriver(latest_release_version)
    }

  } catch (e) {
    console.error('未检测到本机安装的Chrome浏览器')
    console.log(e)
  }
}

const get_latest_release_version = (chrome_version) => {
  return new Promise((resolve, reject) => {
    https.get('https://cdn.npm.taobao.org/dist/chromedriver/LATEST_RELEASE_' + chrome_version, (res) => {
      res.on('data', (data) => {
        console.log('https data', data.toString())
        resolve(data.toString())
      })
      res.on('end', () => {
        console.log('https end')
      })
    }).on('error', (error) => {
      console.log('https error', error)
      reject(error)
    })
  })
}

const downloadChromeDriver = (latest_release_version) => {
  return new Promise((resolve, reject) => {
    https.get('https://cdn.npm.taobao.org/dist/chromedriver/' + latest_release_version + '/chromedriver_win32.zip', (res) => {
      const zipFilePath = path.join(path.resolve(), '/.uiauto/temp/chromedriver.zip')
      const writeStream = fs.createWriteStream(zipFilePath)
      res.on('data', (data) => {
        writeStream.write(data)
        resolve(true)
      })
      res.on('end', () => {
        console.log('downloadChromeDriver https end')

        writeStream.close()
      })

      writeStream.on('finish', () => {
        console.log('downloadChromeDriver finish')

        decompress(zipFilePath, path.join(path.resolve(), '/env/webdriver/win32'))
          .then((files) => {
            console.log('downloadChromeDriver>>>>>>>', files)

            fs.unlinkSync(zipFilePath)
          })
          .catch((error) => {
            console.log('downloadChromeDriver>>>>>>>', error)
          })
      })
    }).on('error', (error) => {
      console.log('downloadChromeDriver https error', error)
      reject(error)
    })
  })
}

const getCurrentChromeDriverVersion = () => {
  const driver_path = path.join(path.resolve(), '/env/webdriver/win32/chromedriver.exe')
  let driver_shell = child_process.execSync(driver_path + ' --version')
  return driver_shell.toString().split(' ')[1]
}

checkChromeDriver()

startInterval();

function startInterval() {
  window.require(path.normalize(path.resolve() + '/public/cron/index.js')).cronFn();
}

npm.load({}, (err) => {
    if (err) {
        return false;
    }
    // 切换npm源
    npm.config.set('registry', 'https://registry.npm.taobao.org');
    console.log(npm.config.get('registry'));
});

if (!fs.existsSync("C:\\logs")) {
    fs.mkdirSync("C:\\logs")
}

window['executor'].execute_python(`${path.resolve()}\\public\\pyscript\\deviceid\\deviceid.py`, 'get_device_id', null)
    .then(result => {
        console.log('deviceid>>>>>>>>>>', result);
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify({}))
        }

        const config = fse.readJsonSync(configPath);
        config.deviceId = result;
        fs.writeFileSync(configPath, JSON.stringify(config, null, '\t'))
    })
    .catch(err => {
        console.log('生成机器码出错', err);
    });




