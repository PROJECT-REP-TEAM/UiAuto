/*
 * @Author: chenzy
 * @LastEditors: chenzy
 * @Date: 2019-08-20 20:19:40
 * @LastEditTime: 2019-08-26 15:44:34
 * @Description: file content
 */
let path = window.nodeRequire('path')
let fse = window.nodeRequire('fs-extra')
let fs = window.nodeRequire('fs')
let decompress = window.nodeRequire('decompress')
let { download, allDownload } = require('@/utils/electron.js')
let async = require('async');
import store from '@/store'
import config from '@/config/environment/index'
import { pluginViews } from '@/api/plugin'
import { Notification } from 'element-ui'

export function getSynchronizeParams(data = []) {
  return new Promise((resolve, reject) => {
    const needSynchronizeProjects = []
    const file_name_list = _.difference(fs.readdirSync(config.projectsPath), ['.DS_Store'])

    // 云端项目列表
    _.each(data, (data_item, idx) => {
      const downloadParams = {
        project: data_item,
        listener_name: `downstate${data_item.scriptId}`,
        downloadUrl: `${config.serverUrl}/uiauto/script/download?scriptId=${data_item.scriptId}&token=${localStorage.getItem('uiauto_access_token')}`,
        configPath: path.normalize(`${config.projectsPath}/../projects_temp/`),
        isInstallPlugin: true
      }
      downloadParams.downloadPath = `${downloadParams.configPath}${downloadParams.project.projectName}.zip`;
      // 如本地已存在  则更新版本号是否更新
      if (_.indexOf(file_name_list, data_item.projectName) > -1) {
        const jsonPath = path.normalize(`${config.projectsPath}/${data_item.projectName}/${data_item.projectName}.json`)
        const projectJson = fse.readJsonSync(jsonPath)
        if (data_item.version > projectJson.updateAt.replace(/[: \r\n-]/g, '')) {
          needSynchronizeProjects.push(downloadParams)
        }
      } else {
        needSynchronizeProjects.push(downloadParams)
      }
    })

    if (needSynchronizeProjects.length) {
      downloadProject(needSynchronizeProjects).then(() => {
        resolve({
          isSuccess: true,
          message: '同步完成，请留意插件安装情况！'
        })
      })
    } else {
      resolve({
        isSuccess: true,
        message: '没有需要同步的项目'
      })
    }
  })
}

export function downloadDemo(download_path) {
  return new Promise((resolve, reject) => {
    const downData = {
      project: {
        downloadUrl: download_path,
        projectName: '示例项目'
      },
      listener_name: 'downstate示例项目.zip',
      downloadUrl: download_path,
      configPath: path.normalize(`${config.projectsPath}/../projects_temp/`),
      isInstallPlugin: false
    }
    downData.downloadPath = `${downData.configPath}${downData.project.projectName}.zip`;

    downloadProject([downData]).then(() => {
      resolve({
        isSuccess: true,
        message: '同步完成'
      })
    })
  })
}

export function downloadProject(projects) {
  let obj = {};
  return new Promise((resolve, reject) => {
    async.mapSeries(projects, (item, cb) => {
      download(item).then(() => {
        decompress(item.downloadPath, config.projectsPath, {
          filter: function (file) {
            var r = true
            if (file.path.startsWith('__MACOSX')) {
              r = false
            }
            return r
          }
        }).then(files => {
          console.log('解压成功，放入项目库。')
          fs.unlinkSync(item.downloadPath)
          if (item.isInstallPlugin) {
            obj[item.project.projectName] = files;
            cb(null, item);
          } else {
            cb(null, item);
          }
        }).catch(err => {
          Notification({
            type: '文件解压出错',
            message: err,
            duration: 0,
            dangerouslyUseHTMLString: true,
            offset: 25
          })
          if (fs.existsSync(path.normalize(config.projectsPath + '/' + item.project.projectName))) {
            fse.emptyDirSync(path.normalize(config.projectsPath + '/' + item.project.projectName))
            fs.rmdirSync(path.normalize(config.projectsPath + '/' + item.project.projectName))
          }
          fs.unlinkSync(`${item.configPath}/${item.project.projectName}.zip`)
          cb(null, item);
        })
      }).catch(() => {
        cb(null, null);
      })
    }, (err, res) => {
      getDownloadParams(obj);
      resolve();
    })
  })
}

export function getDownloadParams(obj) {
  return new Promise((resolve, reject) => {

    // 线上插件库
    const onlinePlugins = []
    // 需要下载的插件及版本
    const needDownPlugins = []
    // 项目用到的插件及版本
    const projectPlugins = []
    // 本地拥有的插件及版本
    let localPlugins = []
    _.each(_.difference(fs.readdirSync(config.pluginsPath), ['list.json', 'npm_i.sh', '.DS_Store']), item => {
      const versions = _.difference(fs.readdirSync(`${config.pluginsPath}/${item}`), ['.DS_Store'])
      localPlugins = _.concat(localPlugins, _.map(versions, versionItem => {
        return {
          plugin_id: item,
          version: versionItem
        }
      }))
    })


    _.each(obj, (value, key) => {
      _.each(value, valueItem => {
        if (valueItem.path.includes(`${key}.json`)) {
          const readJson = fse.readJsonSync(`${config.projectsPath}/${valueItem.path}`)
          _.each(readJson.nodes, item => {
            if (!_.find(projectPlugins, {
              plugin_id: item.plugin_id,
              version: item.version
            })) {
              projectPlugins.push({
                plugin_id: item.plugin_id,
                version: item.version
              })
            }
          })
        }
      })

    })

    const downPlugins = _.differenceWith(projectPlugins, localPlugins, _.isEqual)

    pluginViews({
      PluginIds: _.map(downPlugins, 'plugin_id').join(',')
    }).then(result => {
      _.map(result.result, (item) => {
        const newPluginObj = _.cloneDeep(item)
        newPluginObj.plugin_id = item.pluginId
        delete newPluginObj.pluginId
        onlinePlugins.push(newPluginObj)
        return item
      })

      // (本地插件版本 + 线上插件版本) 都不存在
      const abnormalPlugins = _.differenceWith(downPlugins, _.map(onlinePlugins, item => {
        return {
          plugin_id: item.plugin_id,
          version: item.version
        }
      }), _.isEqual)

      if (abnormalPlugins.length) {
        const target = _.map(abnormalPlugins, item => {
          return `${item.plugin_id} - ${item.version}`
        })

        Notification({
          type: 'error',
          message: `检测到<br />${target.length > 5 ? `${_.chunk(target, 5)[0].join('<br />')} 等${target.length - 5}个...` : target.join('<br />')} <br />以上插件版本本地且云端不存在`,
          duration: 0,
          dangerouslyUseHTMLString: true,
          offset: 25
        })
      }

      _.each(onlinePlugins, onlinePluginItem => {
        _.each(downPlugins, downPluginItem => {
          if (onlinePluginItem.plugin_id == downPluginItem.plugin_id && onlinePluginItem.version == downPluginItem.version) {
            needDownPlugins.push(onlinePluginItem)
          }
        })
      })

      _.each(needDownPlugins, (item, idx) => {
        item.isUiautoBaseIntegration = eval(item.isUiautoBaseIntegration);
        const downloadParams = {
          plugin_id: item.plugin_id,
          version: item.version,
          downloadRate: 0,
          downloadStatus: null,
          isWaitDownload: true,
          isDownloading: true
        }
        store.commit('plugin/PLUGIN_DOWNLOAD', downloadParams)
        const thePluginStatus = {
          plugin_id: item.plugin_id,
          version: item.version,
          needUpdate: true,
          buttonText: '等待下载'
        }
        store.commit('plugin/PLUGIN_STATUS', thePluginStatus)
      })
      store.commit("plugin/ALL_PLUGIN_DOWNLOADING", true);
      store.commit("plugin/SET_ALL_DOWNLOADS", {
        downloaded: "0",
        errorDownload: "0",
        needDownload: needDownPlugins.length,
        pluginId: null,
      });
      allDownload(needDownPlugins, 0)

    }).catch(error => {
      reject(error)
    })
  })
}
