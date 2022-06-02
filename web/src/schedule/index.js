const { scheduleJob, cancelJob, gracefulShutdown, scheduledJobs } = require('node-schedule')
const fs = window.nodeRequire('fs')
const _ = require('lodash')
const path = window.nodeRequire('path')
const os = window.nodeRequire('os')
const fse = window.nodeRequire('fs-extra')
const config = fse.readJsonSync(`${os.homedir()}/.uiauto/uiauto.conf`)
import store from '@/store'
import moment from 'moment'
const electron = require('@/utils/electron')
const asyncio = require('async')
const { sequelize, Task, Log } = require('../express/database')

const parentPath = config.projectsPath

export const init = () => {
  if (localStorage.getItem('access_token')) {
    const cronSettings = getCronSetting()
    _.forEach(cronSettings, (cronSetting) => {
      if (cronSetting.cron) {
        startJob(cronSetting)
      } else {
        stopJob(cronSetting.project_name)
      }
    })
    loopExecution();
  }
}

export const startJob = (cronSetting) => {
  stopJob(cronSetting.project_name)
  console.info(`【${cronSetting.project_name}】任务启动`)
  scheduleJob(cronSetting.project_name, cronSetting.cron, () => {
    console.log('本次任务开始执行')
    // 本地自动任务执行的处理方法
    console.info(`${cronSetting.project_name} 插入任务记录`)

    // 本地任务表插入数据
    Task.create({
      taskName: cronSetting.project_name,
      name: cronSetting.name,
      triggerMethod: 'auto',
      status: 'waiting'
    }).then(task => {

    }).catch(err => {
      console.error('插入任务记录失败：', err)
    })
  }, () => {
    console.log('本次任务执行完成')
  })
}

export const stopJob = (project_name) => {
  console.warn(`【${project_name}】任务停止`)
  cancelJob(project_name)
}

export const stopAllJob = () => {
  for (let i in scheduledJobs) {
    stopJob(i)
  }
}

const handleExecute = (newJob, browser_info, task, callback) => {
  let json = JSON.parse(fs.readFileSync(`${parentPath}/${newJob.project_name}/${newJob.project_name}.json`, 'utf8'));
  return window.executor.execute(
    newJob.project_name,
    _.assign(
      {
        uiauto_browser: browser_info,
        uiauto_task_id: null
      },
      _.zipObject(
        _.map(json.global_variable, "key"),
        _.map(json.global_variable, "value")
      )),
    {
      localTask: task,
      LogModel: Log
    }
  )
    .then((res) => {
      console.log('-=-=-=执行成功-=-=-=-=', res)
      callback(null, res)
    })
    .catch((err) => {
      console.log('-=-=-=执行出错-=-=-=-=', err)
      callback(err, null)
    })
}

/**
 * @description:                    遍历项目文件，获取所有项目的cron执行规则
 * @param {type}
 * @return:                         Array<Object>
 */
const getCronSetting = () => {
  const returnResults = []
  // log(parentPath)
  // log(fs)
  const projectNames = _.difference(fs.readdirSync(parentPath), ['.DS_Store'])
  // log(projectNames)

  _.each(projectNames, projectName => {
    const projectRoot = `${parentPath}/${projectName}`
    const stat = fs.lstatSync(projectRoot)
    if (!stat.isDirectory()) return
    const projectFile = `${projectRoot}/${projectName}.json`
    if (!fs.existsSync(projectFile)) return

    try {
      const project = JSON.parse(fs.readFileSync(projectFile, 'utf8'))
      project.cron && returnResults.push(_.pick(project, ['project_name', 'name', 'cron', 'time_out', 'retry_interval', 'retry_count']))
    } catch (error) {
      return
    }
  })

  return returnResults
}

// 实时任务发起
const loopExecution = () => {
  console.log(`本地定时任务进程开启 main_process`)
  scheduleJob("main_process", "*/10 * * * * *", () => {
    console.info('当前任务池状态: ', store.state.socket.actuatorStatus)
    if (store.state.socket.actuatorStatus === 'free') {
      Task.findOne({
        where: {
          status: 'waiting'
        },
        order: [["createdAt", "asc"]]
      }).then(task => {
        if (task) {
          let project_info = null;
          // 查找文件json
          const projectRoot = `${parentPath}/${task.taskName}`
          const stat = fs.lstatSync(projectRoot)
          if (!stat.isDirectory()) {
            task.status = 'error'
            task.save()
          }
          const projectFile = `${projectRoot}/${task.taskName}.json`
          if (!fs.existsSync(projectFile)) {
            task.status = 'error'
            task.save()
          }
          const project = JSON.parse(fs.readFileSync(projectFile, 'utf8'))
          project_info = _.pick(project, ['project_name', 'name', 'cron', 'time_out', 'retry_interval', 'retry_count'])

          store.commit('socket/ACTUATOR_STATUS', { actuatorStatus: 'running' })
          electron.window_minimize()

          let browser_info = {}
          const browser_info_path = path.normalize(
            `${os.homedir()}/.uiauto/browser.json`
          )
          if (fs.existsSync(browser_info_path)) {
            browser_info = JSON.parse(fs.readFileSync(browser_info_path))
          }

          project_info.time_out = _.toNumber(project_info.time_out)
          console.info('项目名称：' + project_info.project_name)
          console.info('重试次数：' + project_info.retry_count)
          console.info('重试间隔时间：' + project_info.retry_interval)
          console.info('超时时间：' + project_info.time_out)

          // 开始执行任务
          task.status = 'executing'
          task.save()
          asyncio.retry({
            times: _.toNumber(project_info.retry_count) + 1,
            interval: _.toNumber(project_info.retry_interval)
          }, (retryCallback) => {
            if (!!project_info.time_out && _.toNumber(project_info.time_out) > 0) {
              const timeout = asyncio.timeout((timeoutCallback) => {
                handleExecute(project_info, browser_info, task, timeoutCallback)
              }, project_info.time_out)
              timeout((err, result) => {
                if (err) {
                  console.log(err)
                  window.executor.restart()
                  retryCallback('timeout')
                } else {
                  console.log(result)
                  retryCallback(null, result)
                }
              })
            } else {
              handleExecute(project_info, browser_info, task, retryCallback)
            }
          }, (err, result) => {
            if (err) {
              if (err === 'timeout') {
                task.status = 'timeout'
              } else {
                task.status = 'error'
              }
              console.error('async retry error: ', err)
            } else {
              task.status = 'success'
            }
            store.commit('socket/ACTUATOR_STATUS', { actuatorStatus: 'free' })
            electron.window_maximize()
            Task.update({
              status: task.status
            }, {
              where: {
                id: task.id
              }
            })
          })

        }
      })
    }
  })
}