/*
 * @Author: chenzy
 * @LastEditors: chenzy
 * @Date: 2019-08-20 19:59:59
 * @LastEditTime: 2019-08-22 11:11:41
 * @Description: file content
 */
import config from '@/config/environment/index'
import store from '@/store';
var { getSynchronizeParams } = require("@/utils/synchronizeProject.js")
const os = window.require('os')
const path = window.require('path')
const fs = window.require('fs')
const fse = window.require('fs-extra')
const ip = window.require('ip')
const configPath = `${os.homedir()}/.uiauto/uiauto.conf`
import moment from "moment";

const SocketClient = window.require('socket.io-client')

// const runner = window.require(path.resolve() + '/public/runner')

// 重启执行器
delete window.require.cache[
  path.normalize(
    path.resolve() + "/public/base_integration/uiauto_executor/executor.js"
  )
];
const runner = window.require(
  path.normalize(
    path.resolve() + "/public/base_integration/uiauto_executor/executor.js"
  )
);

const electron = require("@/utils/electron");

var socket_client = null;

export function getSocketClient() {
  return socket_client;
}

export function closeSocket() {
  socket_client.close();
  socket_client = null;
}
export function start_socket_client() {
  start_socket_client_fn();
}

function start_socket_client_fn() {
  const uiautoConfig = fse.readJsonSync(configPath);
  const socketUrl = new URL(uiautoConfig.serverUrl);
  socket_client = socket_client || SocketClient(socketUrl.origin, {
    path: `${socketUrl.pathname}/socket.io`
  });
  socket_client.on('connect', function () {
    console.log('connect>>>>>>>>>>>>>>')
    console.log(uiautoConfig.deviceId)
    store.commit("socket/ONLINE", { socketOnline: true });
    socket_client.emit('UIAUTO_CONNECT', {
      deviceId: uiautoConfig.deviceId,
      access_token: localStorage.getItem('access_token'),
      ip: ip.address(),
      userId: JSON.parse(localStorage.getItem('user')).userId
    }, (data) => {
      console.log('callback>>>>>>>>>', data)
    })

    socket_client.on('UIAUTO_EXECUTE', (data) => {
      socket_client.emit('UIAUTO_UPDATE_TASK', {
        taskId: data.taskId,
        ruleId: data.ruleId,
        projectName: data.projectName,
        status: 'running',
        message: '正在执行'
      })
      electron.window_minimize();
      let params = data.params ? data.params : {};
      params['taskId'] = data.taskId;
      params['uiauto_task_id'] = data.taskId;

      if (runner.hasOwnProperty("restart")) {
        runner.restart();
      }
      runner.execute(data.projectName, params).then(res => {
        console.log('-=-=-=-=-=-=lalallalalalla-=-=then-=-=-=');
        console.log(res);
        socket_client.emit('UIAUTO_UPDATE_TASK', {
          taskId: data.taskId,
          ruleId: data.ruleId,
          projectName: data.projectName,
          status: 'success',
          message: JSON.stringify(res).length > 2500
            ? `${JSON.stringify(res).slice(0, 2500)}..."`
            : JSON.stringify(res)
        })
        electron.window_maximize();
      })
        .catch(err => {
          console.log('-=-=-=-=-=-=lalallalalalla-=-=catch-=-=-=');
          console.warn(err);
          socket_client.emit('UIAUTO_UPDATE_TASK', {
            taskId: data.taskId,
            ruleId: data.ruleId,
            projectName: data.projectName,
            status: 'fail',
            message: JSON.stringify(err) === "{}"
              ? ""
              : JSON.stringify(err).length > 2500
                ? `${JSON.stringify(err).slice(0, 2500)}..."`
                : JSON.stringify(err)
          })
          electron.window_maximize();
        });
    })

    socket_client.on('UIAUTO_STOPEXECUTE', (data) => {
      runner.restart();
      electron.window_maximize();
    })

    socket_client.on('UIAUTO_UPDATE_CRON', (data) => {
      console.warn('UIAUTO_UPDATE_CRON!!!');
      const project_path = path.normalize(`${config.projectsPath}/${data.projectName}/${data.projectName}.json`);
      const project_config = JSON.parse(fs.readFileSync(project_path, 'utf8'));
      if (project_config.project_type == 'cloud') {
        project_config.cron = data.cron;
        fs.writeFileSync(project_path, JSON.stringify(project_config, null, '\t'));
      }
    });

    socket_client.on('GET_CLOUD_PROJECTS', datas => {
      console.warn('GET_CLOUD_PROJECTS!!!');
      if (datas.length > 0) {
        getSynchronizeParams(datas);
      }
    })
  });

  socket_client.on('connect_error', function (error) {
    console.warn('socket error>>>>>', error);
    store.commit("socket/ONLINE", { socketOnline: false });
    // socket_client.close();
  });
  socket_client.on('disconnect', function () {
    console.log('disconnect>>>>>>>>>>>>>>.')
    store.commit("socket/ONLINE", { socketOnline: false });
    socket_client.close();
    socket_client = null;
    start_socket_client_fn();
  })
}
