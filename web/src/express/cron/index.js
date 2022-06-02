import $ from 'jquery'

const { CronJob } = require('cron')
const fs = window.nodeRequire('fs')
const _ = require('lodash')
const crypto = require('crypto')
const path = window.nodeRequire('path')
const os = window.nodeRequire('os')
const fse = window.nodeRequire('fs-extra')
const config = fse.readJsonSync(`${os.homedir()}/.uiauto/uiauto.conf`)
import store from '@/store'
import moment from 'moment'
const electron = require('@/utils/electron')
const asyncio = require('async')
const { sequelize, Task, Log } = require('../database')

// 重启执行器
delete window.nodeRequire.cache[
  path.normalize(
    path.resolve() + '/public/base_integration/uiauto_executor/executor.js'
  )]

const runner = window.executor

const runningJobCron = []
console.log('local cron start ')
console.log('actuator status：' + store.state.socket.actuatorStatus)

export const start = () => {
  const parentPath = config.projectsPath

  /**
   * @description:                    每十秒钟判断cron规则有无改变
   * @param {type}
   * @return:
   */
  const jobCron = new CronJob({
    cronTime: '*/10 * * * * *',
    onTick: () => {
      // 检测是否有新增的定时任务
      try {
        refreshIntervalCron().then((result) => {
          console.log(result)
          // jobCron.start()
        }).catch((err) => {
          console.log('===========检测规则出错==========')
          console.log(err)
          // jobCron.start()
        })
      } catch (error) {
        console.log('===========jobCron error==========')
        console.log(error)
      }
    },
    onComplete: () => {
      console.log('=====onComplete=====')
      if (jobCron) {
        jobCron.start()
      }
    },
    start: true,
    timeZone: 'Asia/Shanghai'
  })

  const refreshIntervalCron = () => {
    return new Promise((resolve, reject) => {
      try {
        // 统计执行规则方法
        const cronSettings = getCronSetting()
        console.log(cronSettings)
        _.each(cronSettings, cronSetting => {
          // const hashObject = cronSetting
          const en_text = _.join(_.values(cronSetting), ',')
          cronSetting.hashId = crypto.createHash('md5').update(en_text).digest('hex')
        })

        // 正在运行的id
        const runningHashIds = _.map(runningJobCron, 'hashId')
        const allJobHashIds = _.map(cronSettings, 'hashId')
        const newHashIds = _.difference(allJobHashIds, runningHashIds)
        const removeHashIds = _.difference(runningHashIds, allJobHashIds)

        // 移除已经作废的任务
        _.each(removeHashIds, (hashId, index) => {
          const removeIndex = _.findIndex(runningJobCron, {
            hashId: hashId
          })
          console.log('-----移除已经作废的任务----')
          console.log(removeIndex)
          runningJobCron[removeIndex].cron.stop()
          _.pullAt(runningJobCron, removeIndex)
        })

        // 新增任务
        _.each(newHashIds, (hashId, index) => {
          const newJob = _.find(cronSettings, {
            hashId: hashId
          })
          console.log(newJob.cron)
          const newCron = new CronJob({
            cronTime: newJob.cron,
            onTick: (callback) => {
              // 本地自动任务执行的处理方法
              console.info(`${newJob.project_name} is running: ${moment().format('YYYY-MM-DD HH:mm:ss')}`)
              if (store.state.socket.actuatorStatus === 'free') {
                store.commit('socket/ACTUATOR_STATUS', { actuatorStatus: 'running' })
                electron.window_minimize()

                let browser_info = {}
                const browser_info_path = path.normalize(
                  `${os.homedir()}/.uiauto/browser.json`
                )
                if (fs.existsSync(browser_info_path)) {
                  browser_info = JSON.parse(fs.readFileSync(browser_info_path))
                }

                newJob.time_out = _.toNumber(newJob.time_out)
                console.info('项目名称：' + newJob.project_name)
                console.info('重试次数：' + newJob.retry_count)
                console.info('重试间隔时间：' + newJob.retry_interval)
                console.info('超时时间：' + newJob.time_out)

                Task.create({
                  taskName: newJob.project_name,
                  triggerMethod: 'auto',
                  status: 'waiting'
                })
                  .then(task => {
                    console.info(task)
                    // 开始执行任务
                    task.status = 'executing'
                    task.save()
                    asyncio.retry({
                      times: _.toNumber(newJob.retry_count) + 1,
                      interval: _.toNumber(newJob.retry_interval)
                    }, (retryCallback) => {
                      if (!!newJob.time_out && _.toNumber(newJob.time_out) > 0) {
                        const timeout = asyncio.timeout((timeoutCallback) => {
                          handleExecute(newJob, browser_info, task, timeoutCallback)
                        }, newJob.time_out)
                        timeout((err, result) => {
                          if (err) {
                            console.log(err)
                            runner.restart()
                            retryCallback('timeout')
                          } else {
                            console.log(result)
                            retryCallback(null, result)
                          }
                        })
                      } else {
                        handleExecute(newJob, browser_info, task, retryCallback)
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
                      callback('finish')
                      Task.update({
                        status: task.status
                      }, {
                        where: {
                          id: task.id
                        }
                      })
                    })
                  })
                  .catch(err => {
                    console.error('插入任务记录失败：', err)
                  })
              }
            },
            onComplete: (data) => {
              console.log(data, moment().format('YYYY-MM-DD HH:mm:ss'))
              electron.window_maximize()
            },
            start: true,
            timeZone: 'Asia/Shanghai'
          })
          runningJobCron.push({
            project_name: newJob.project_name,
            hashId: hashId,
            cron: newCron
          })
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  const handleExecute = (newJob, browser_info, task, callback) => {
    return runner
      .execute(
        newJob.project_name,
        {
          uiauto_browser: browser_info,
          uiauto_task_id: null
        },
        {
          localTask: task,
          LogModel: Log
        }
      )
      .then((res) => {
        console.log('-=-=-=执行成功-=-=-=-=')
        console.log(res)
        callback(null, res)
      })
      .catch((err) => {
        console.log('-=-=-=执行出错-=-=-=-=')
        console.log(err)
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
        // project.cron && returnResults.push({ project_name: project.project_name, cron: project.cron })
        project.cron && returnResults.push(_.pick(project, ['project_name', 'cron', 'time_out', 'retry_interval', 'retry_count']))
      } catch (error) {
        return
      }
    })

    return returnResults
  }
}
