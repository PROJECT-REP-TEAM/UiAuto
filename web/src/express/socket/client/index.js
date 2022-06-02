/*
 * @Author: chenzy
 * @LastEditors: chenzy
 * @Date: 2019-08-20 19:59:59
 * @LastEditTime: 2019-08-22 11:11:41
 * @Description: file content
 */
import config from '@/config/environment/index'
import store from '@/store'
import {
  MessageBox
} from 'element-ui'
var {
  getSynchronizeParams
} = require('@/utils/synchronizeProject.js')
import {
  toLogin
} from '@/utils/auth'
const os = window.nodeRequire('os')
const path = window.nodeRequire('path')
const fs = window.nodeRequire('fs')
const fse = window.nodeRequire('fs-extra')
const ip = window.nodeRequire('ip')
const configPath = `${os.homedir()}/.uiauto/uiauto.conf`
const {
  app
} = window.nodeRequire('@electron/remote');
import {
  getStoreList
} from "@/api/application";

const SocketClient = window.nodeRequire('socket.io-client')

// const runner = window.nodeRequire(path.resolve() + '/public/runner')

let runner;

// 重启执行器
if (os.platform() == 'darwin' && path.resolve() == "/") {
  delete window.nodeRequire.cache[
    path.normalize(app.getPath("exe") + '../../../public/base_integration/uiauto_executor/executor.js')
  ]
  runner = window.nodeRequire(
    path.normalize(app.getPath("exe") + '../../../public/base_integration/uiauto_executor/executor.js')
  )
} else {
  delete window.nodeRequire.cache[
    path.normalize(
      path.resolve() + '/public/base_integration/uiauto_executor/executor.js'
    )
  ]
  runner = window.nodeRequire(
    path.normalize(
      path.resolve() + '/public/base_integration/uiauto_executor/executor.js'
    )
  )
}


const electron = require('@/utils/electron')

var socket_client = null

export function getSocketClient() {
  return socket_client
}

export function closeSocket() {
  socket_client.close()
  socket_client = null
}
export function start_socket_client() {
  start_socket_client_fn()
}

function start_socket_client_fn() {
  const uiautoConfig = fse.readJsonSync(configPath)
  const socketUrl = new URL(uiautoConfig.serverUrl)
  console.log('start_socket_client_fn>>>>>>>>>>>', socketUrl.origin)
  socket_client = SocketClient.connect(socketUrl.origin, {
    transports: ['websocket'],
    query: {
      'client-type': 'UIAUTO',
      'actuator-code': JSON.parse(localStorage.getItem('user')).username,
      'token': localStorage.getItem('uiauto_access_token')
    },
    forceNew: false,
    reconnection: true,
    reconnectionDelay: 5000,
    reconnectionDelayMax: 60000
  })

  const timer = null
  const sendHeartBeat = () => {
    if (socket_client && socket_client.connected) {
      socket_client.emit('HEART_CHECK', {
        actuatorStatus: store.state.socket.actuatorStatus
      }, (data) => {
        // console.log("server is status: " + data)
        setTimeout(() => {
          sendHeartBeat()
        }, 1000)
      })
    }
  }


  // 心跳检测
  socket_client.on('HEART_CHECK', (callback) => {
    callback({
      actuatorStatus: store.state.socket.actuatorStatus
    })
  })

  socket_client.on('reconnect', () => {
    console.warn('socket client reconnect');
    setTimeout(() => {
      try {
        MessageBox.close()
      } catch (error) {
      }
    }, 1000);
  })

  socket_client.on('UIAUTO_EXECUTE', (data, callback) => {
    if (store.state.socket.actuatorStatus === 'free') {
      store.commit('socket/ACTUATOR_STATUS', {
        actuatorStatus: 'running'
      })
      electron.window_minimize()
      const params = data.params ? data.params : {}
      params['taskId'] = data.taskId
      params['uiauto_task_id'] = data.taskId
      if (!fs.existsSync(`${config.projectsPath}/${data.projectName}/${data.projectName}.json`)) {
        callback({
          code: -1,
          success: false,
          error: `${config.projectsPath}/${data.projectName}/${data.projectName}.json 项目文件不存在`
        })
        electron.window_maximize()
        store.commit('socket/ACTUATOR_STATUS', {
          actuatorStatus: 'free'
        })
      } else {
        let json = JSON.parse(fs.readFileSync(`${config.projectsPath}/${data.projectName}/${data.projectName}.json`, 'utf8'));

        if (runner.hasOwnProperty('restart')) {
          runner.restart()
        }
        runner.execute(data.projectName, _.assign(params, _.zipObject(
          _.map(json.global_variable, "key"),
          _.map(json.global_variable, "value")
        )), {
          taskId: data.taskId,
          socket_client: socket_client
        }).then(res => {
          console.log('-=-=-=-=-=-=lalallalalalla-=-=then-=-=-=')
          console.log(res)
          callback({
            code: 0,
            success: true
          })
          electron.window_maximize()
          store.commit('socket/ACTUATOR_STATUS', {
            actuatorStatus: 'free'
          })
        })
          .catch(err => {
            console.log('-=-=-=-=-=-=lalallalalalla-=-=catch-=-=-=')
            console.warn(err)
            callback({
              code: -1,
              success: false,
              error: JSON.stringify(err)
            })
            electron.window_maximize()
            store.commit('socket/ACTUATOR_STATUS', {
              actuatorStatus: 'free'
            })
          })
      }
    }
  })

  socket_client.on('STOP_EXECUTE', (callback) => {
    try {
      runner.restart()
      store.commit('socket/ACTUATOR_STATUS', {
        actuatorStatus: 'free'
      })
      electron.window_maximize()
      callback({
        code: 0,
        success: true
      })
      store.commit('socket/ACTUATOR_STATUS', {
        actuatorStatus: 'free'
      })
    } catch (e) {
      callback({
        code: -1,
        success: false
      })
      store.commit('socket/ACTUATOR_STATUS', {
        actuatorStatus: 'offline'
      })
    }
  })

  socket_client.on('UIAUTO_UPDATE_CRON', (data) => {
    console.warn('UIAUTO_UPDATE_CRON!!!')
    const project_path = path.normalize(`${config.projectsPath}/${data.projectName}/${data.projectName}.json`)
    const project_config = JSON.parse(fs.readFileSync(project_path, 'utf8'))
    if (project_config.project_type == 'cloud') {
      project_config.cron = data.cron
      fs.writeFileSync(project_path, JSON.stringify(project_config, null, '\t'))
    }
  })

  socket_client.on('GET_CLOUD_PROJECTS', datas => {
    console.warn('GET_CLOUD_PROJECTS!!!')
    if (datas.length > 0) {
      getSynchronizeParams(datas)
    }
  })

  socket_client.on('connect', function () {
    console.log('connect>>>>>>>>>>>>>>')
    setTimeout(() => {
      try {
        MessageBox.close()
      } catch (error) {
      }
    }, 1000);
    console.log(uiautoConfig.deviceId)
    store.commit('socket/ONLINE', {
      socketOnline: true
    })
    store.commit('socket/ACTUATOR_STATUS', {
      actuatorStatus: 'free'
    })
    setTimeout(() => {
      if (socket_client) {
        socket_client.emit('UIAUTO_CONNECT', {
          deviceId: uiautoConfig.deviceId,
          access_token: localStorage.getItem('access_token'),
          ip: ip.address(),
          userId: JSON.parse(localStorage.getItem('user')).userId
        }, (data) => {
          console.log('callback>>>>>>>>>', data)
        })
      }
      sendHeartBeat()
    }, 5000)
  })

  socket_client.on('connect_error', function (err) {
    console.warn('socket err>>>>>')
    console.log(err);
    console.log(store.state.socket.socketOnline);
    if (store.state.socket.socketOnline === false) {
      getStoreList({
        optType: "store",
        status: "public",
      })
    }
    store.commit('socket/ONLINE', {
      socketOnline: false
    })
    store.commit('socket/ACTUATOR_STATUS', {
      actuatorStatus: 'offline'
    })
    // socket_client.close();
    // start_socket_client_fn();
  })
  socket_client.on('disconnect', function () {
    console.log('disconnect>>>>>>>>>>>>>>.')
    store.commit('socket/ONLINE', {
      socketOnline: false
    })
    store.commit('socket/ACTUATOR_STATUS', {
      actuatorStatus: 'offline'
    })
    // 跳转登录界面
    MessageBox.confirm('连接已断开，是否重新登录?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      toLogin()
    }).catch(() => {

    });

    // socket_client.close();
    // socket_client = null;
    // start_socket_client_fn();
  })
}
