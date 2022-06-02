/*
 * @Author: chenzy
 * @LastEditors: chenzy
 * @Date: 2019-07-17 13:07:26
 * @LastEditTime: 2019-08-28 13:52:46
 * @Description: file content
 */
const ipc = window.nodeRequire('electron').ipcRenderer
const { app } = window.nodeRequire('@electron/remote');
const decompress = window.nodeRequire('decompress')
const path = window.nodeRequire('path')
const got = window.nodeRequire('got')
const fse = window.nodeRequire('fs-extra')
const fs = window.nodeRequire('fs')
const os = window.nodeRequire('os')
const crypto = window.nodeRequire('crypto')
var {
  nodeInit,
  pythonInit
} = require('@/utils/init.js')
import store from '@/store'
import environment from '@/config/environment'
import config from '@/config/environment/index'

export function fileSelector(options = {}) {
  return new Promise((resolve, reject) => {
    options.listener_name = options.listener_name || 'file-selector-result'
    console.log(options.listener_name)
    // 超时监听器
    // var timeoutListener = setTimeout(() => {
    //   ipc.removeAllListeners([options.listener_name]);
    //   reject('timeout');
    // }, 60 * 1000);

    // 打开文件选择器
    ipc.send('file-selector', options)

    // electron 框架事件处理
    ipc.on(options.listener_name, function (event, result) {
      console.info('success')
      //   clearTimeout(timeoutListener);
      // 移除监听事件
      ipc.removeAllListeners([options.listener_name])

      resolve(result)
    })
  })
}

function tco(f) {
  var value
  var active = false
  var accumulated = []
  return function accumulator() {
    accumulated.push(arguments)
    if (!active) {
      active = true
      while (accumulated.length) {
        value = f.apply(this, accumulated.shift())
      }
      active = false
      return value
    }
  }
}

export function setQueryConfig(params) {
  var _str = ''
  for (var o in params) {
    _str += o + '=' + params[o] + '&'
  }
  var _str = _str.substring(0, _str.length - 1)
  return _str
}

export function download(options = {}) {
  return new Promise((resolve, reject) => {
    console.warn(options)
    fse.ensureDir(options.configPath)
      .then(() => {
        got(options.downloadUrl, {
          responseType: "buffer"
        }).then((response) => {
          if (response.statusCode === 200) {
            fse.writeFileSync(options.downloadPath, response.body)
            resolve()
          } else {
            reject("statusCode no 200")
          }
        }).catch(err => {
          reject(err)
        })
      })
      .catch(err => {
        reject(err)
      })
  })
}

export const executeDownload = function (plugin) {
  return new Promise((resolve, reject) => {
    const downloadParams = {
      plugin_id: plugin.plugin_id,
      version: plugin.version,
      // downloadRate: 0,
      downloadStatus: null,
      isWaitDownload: false,
      isDownloading: true,
      isUiautoBaseIntegration: !!plugin.isUiautoBaseIntegration
    }
    store
      .dispatch('plugin/pluginDownload', downloadParams)
      .then(result => {
        const thePluginStatus = {
          plugin_id: plugin.plugin_id,
          version: plugin.version,
          needUpdate: true,
          buttonText: '正在下载'
        }
        store
          .dispatch('plugin/pluginStatus', thePluginStatus)
          .then(pluginStatus => {
            console.warn('正在下载')
            const attachment_name = plugin.attachmentPath.substring(plugin.attachmentPath.lastIndexOf('\/') + 1, plugin.attachmentPath.lastIndexOf('\/').length)
            const access_token = localStorage.getItem('uiauto_access_token')
            const params = {
              pluginId: plugin.plugin_id,
              // filePath: `plugin/${attachment_name}`,
              version: plugin.version,
              token: access_token
            }
            const queryConfig = setQueryConfig(params)
            const downloadUrl = `${environment.serverUrl}/uiauto/plugin/download?${queryConfig}`
            // 判断attachmentPath不为空
            // todo
            pluginDownload({
              plugin: plugin,
              listener_name: `downstate${attachment_name}`,
              downloadUrl: downloadUrl,
              attachment_name: attachment_name,
              downloadPath: path.normalize(`${config.pluginsPath}/../plugins_temp/${attachment_name}`),
              // downloadPath: `${environment.serverUrl}/downloads/plugins/${plugin.plugin_id}/${plugin.plugin_id}@${plugin.latestVersion || plugin.version}`,
              configPath: path.normalize(`${config.pluginsPath}/../plugins_temp/`)
            })
              .then(result => {
                store
                  .dispatch('plugin/pluginDownloadDelete', `${plugin.plugin_id}${plugin.version}`)
                  .then(pluginDownloadDelete => {
                    console.warn(`${plugin.plugin_id}已安装`)
                    const thePluginStatus = {
                      plugin_id: plugin.plugin_id,
                      version: plugin.version,
                      needUpdate: false,
                      buttonText: '已安装'
                    }
                    store
                      .dispatch('plugin/pluginStatus', thePluginStatus)
                      .then(pluginStatus => {
                        resolve(result)
                      })
                    if (plugin.language === 'python') {
                      store.commit(
                        'plugin/MARK_PYTHON_DOWNLOADING',
                        false
                      )
                    }
                  })
              })
              .catch(err => {
                console.warn('pluginDownload err')
                console.warn(err)
                const thePluginStatus = {
                  plugin_id: plugin.plugin_id,
                  version: plugin.version,
                  needUpdate: true,
                  buttonText: '重新下载'
                }
                if (plugin.language === 'python') {
                  store.commit(
                    'plugin/MARK_PYTHON_DOWNLOADING',
                    false
                  )
                }
                store
                  .dispatch('plugin/pluginStatus', thePluginStatus)
                  .then(the_result => {
                    reject(err)
                  })
              })
          })
      })
      .catch(err => {
        const thePluginStatus = {
          plugin_id: plugin.plugin_id,
          version: plugin.version,
          needUpdate: true,
          buttonText: '重新下载'
        }
        if (plugin.language === 'python') {
          store.commit('plugin/MARK_PYTHON_DOWNLOADING', false)
        }
        store
          .dispatch('plugin/pluginStatus', thePluginStatus)
          .then(the_result => {
            reject(err)
          })
      })
  })
}

export const allDownload = tco(function (webPlugin, index, downloaded = [], notDownloaded = [], errorDownload = [], total = 0) {
  // console.warn('allDownload  download_plugin')
  // console.warn(webPlugin)
  if (
    index === webPlugin.length &&
    downloaded.length + errorDownload.length === webPlugin.length
  ) {
    console.warn('allDownload  END')
    setTimeout(() => {
      store.commit('plugin/ALL_PLUGIN_DOWNLOADING', false)
    }, 2000)
    store.commit('plugin/SET_ALL_DOWNLOADS', {
      downloaded: downloaded.length,
      errorDownload: errorDownload.length,
      needDownload: webPlugin.length,
      pluginId: null
    })
  } else if (
    index === webPlugin.length &&
    downloaded.length + errorDownload.length < webPlugin.length
  ) {
    if (store.state.plugin.has_python_downloading) {
      if (total > 5) {
        console.warn('allDownload total > 5')
        console.warn(notDownloaded)
        store.commit('plugin/SET_ALL_DOWNLOADS', {
          downloaded: downloaded.length,
          errorDownload: errorDownload.length + notDownloaded.length,
          needDownload: webPlugin.length,
          pluginId: null
        })
        setTimeout(() => {
          store.commit('plugin/ALL_PLUGIN_DOWNLOADING', false)
        }, 2000)
        _.each(notDownloaded, (notDownloadedItem, idx) => {
          const downloadParams = {
            plugin_id: notDownloadedItem.plugin_id,
            version: notDownloadedItem.version,
            // downloadRate: 90,
            downloadStatus: 'exception',
            isWaitDownload: false,
            isDownloading: false,
            errLog: '等待下载时间超时'
          }
          const statusParams = {
            plugin_id: notDownloadedItem.plugin_id,
            version: notDownloadedItem.version,
            needUpdate: true,
            buttonText: '重新下载'
          }
          store.commit('plugin/PLUGIN_DOWNLOAD', downloadParams)
          store.commit('plugin/PLUGIN_STATUS', statusParams)
        })
      } else {
        setTimeout(() => {
          console.warn('allDownload setTimeout 10000')
          total++
          allDownload(webPlugin, index, downloaded, notDownloaded, errorDownload, total)
        }, 10000)
      }
    } else {
      store.commit('plugin/MARK_PYTHON_DOWNLOADING', true)
      store.commit('plugin/SET_ALL_DOWNLOADS', {
        downloaded: downloaded.length,
        errorDownload: errorDownload.length,
        needDownload: webPlugin.length,
        pluginId: notDownloaded[0].plugin_id
      })
      executeDownload(notDownloaded[0])
        .then(result => {
          downloaded.push(notDownloaded[0])
          _.remove(notDownloaded, function (item) {
            return item == notDownloaded[0]
          })
          allDownload(webPlugin, index, downloaded, notDownloaded, errorDownload)
        })
        .catch(err => {
          errorDownload.push(notDownloaded[0])
          _.remove(notDownloaded, function (item) {
            return item == notDownloaded[0]
          })
          allDownload(webPlugin, index, downloaded, notDownloaded, errorDownload)
        })
    }
  } else {
    console.warn('allDownload downloading')
    // console.warn(index)
    // console.warn(webPlugin)
    const webPlugin_param = webPlugin[index]
    // console.warn(webPlugin_param);
    if (webPlugin_param.language === 'python') {
      if (store.state.plugin.has_python_downloading) {
        notDownloaded.push(webPlugin_param)
        index++
        store.commit('plugin/SET_ALL_DOWNLOADS', {
          downloaded: downloaded.length,
          errorDownload: errorDownload.length,
          needDownload: webPlugin.length,
          pluginId: webPlugin_param.plugin_id
        })
        allDownload(webPlugin, index, downloaded, notDownloaded, errorDownload)
      } else {
        store.commit('plugin/MARK_PYTHON_DOWNLOADING', true)
        store.commit('plugin/SET_ALL_DOWNLOADS', {
          downloaded: downloaded.length,
          errorDownload: errorDownload.length,
          needDownload: webPlugin.length,
          pluginId: webPlugin_param.plugin_id
        })
        executeDownload(webPlugin_param)
          .then(result => {
            downloaded.push(webPlugin_param)
            index++
            allDownload(webPlugin, index, downloaded, notDownloaded, errorDownload)
          })
          .catch(err => {
            errorDownload.push(webPlugin_param)
            index++
            allDownload(webPlugin, index, downloaded, notDownloaded, errorDownload)
          })
      }
    } else {
      store.commit('plugin/SET_ALL_DOWNLOADS', {
        downloaded: downloaded.length,
        errorDownload: errorDownload.length,
        needDownload: webPlugin.length,
        pluginId: webPlugin_param.plugin_id
      })
      executeDownload(webPlugin_param)
        .then(result => {
          downloaded.push(webPlugin_param)
          index++
          allDownload(webPlugin, index, downloaded, notDownloaded, errorDownload)
        })
        .catch(err => {
          errorDownload.push(webPlugin_param)
          index++
          allDownload(webPlugin, index, downloaded, notDownloaded, errorDownload)
        })
    }
  }
})

export function pluginDownload(options = {}) {
  return new Promise((resolve, reject) => {
    // ipc.send('download', options)
    // ipc.on(options.listener_name, function (event, result) {
    // console.log('###########')
    // console.log(result)
    const downloadParams = {
      plugin_id: options.plugin.plugin_id,
      version: options.plugin.version,
      downloadStatus: null,
      isWaitDownload: false,
      isDownloading: true
    }
    store.commit('plugin/PLUGIN_DOWNLOAD', downloadParams)
    download(options).then(result => {
      let resultPath = path.normalize(options.configPath + options.attachment_name)
      let base_integration_path;
      if (os.platform() === 'darwin' && path.resolve() == '/') {
        base_integration_path = path.normalize(app.getPath("exe") + '../../../public/base_integration/')
      } else {
        base_integration_path = path.normalize(path.join(path.resolve(), '/public/base_integration/'))
      }
      var pluginPath = ''
      if (options.plugin.isUiautoBaseIntegration) {
        pluginPath = base_integration_path
      } else {
        pluginPath = path.normalize(config.pluginsPath + '/')
      }
      var pluginTempPath = path.normalize(`${config.pluginsPath}/../plugins_temp/${options.plugin.plugin_id}/${options.plugin.version}/`)
      var folderPath = ''
      if (fse.existsSync(resultPath)) {
        const fileContent = fse.readFileSync(resultPath)
        const hashId = crypto.createHash('md5').update(fileContent).digest('hex')
        // console.log('hashId', hashId)
        // console.log(options.plugin)
        if (options.plugin.attachmentMd5 != null && options.plugin.attachmentMd5 === hashId) {
          decompress(resultPath, pluginTempPath, {
            filter: function (file) {
              var r = true;
              if (file.path.startsWith("__MACOSX")) {
                r = false;
              }
              if (file.type === 'file' && file.path.endsWith('/')) {
                file.type = 'directory'
              }
              return r;
            }
          }).then(files => {
            console.log('decompress success')
            const downloadParams = {
              plugin_id: options.plugin.plugin_id,
              version: options.plugin.version,
              // downloadRate: 90,
              downloadStatus: null,
              isWaitDownload: false,
              isDownloading: true
            }
            store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
              var folderName = files[0].path.split('/')[0]
              folderPath = path.normalize(pluginTempPath + folderName)
              var packagePath = path.normalize(folderPath + '/' + 'package.json')
              if (!fse.existsSync(folderPath) ||
                !fse.existsSync(packagePath)) {
                fse.remove(resultPath)
                fse.remove(folderPath)
                fse.remove(pluginTempPath)
                const downloadParams = {
                  plugin_id: options.plugin.plugin_id,
                  version: options.plugin.version,
                  // downloadRate: 90,
                  downloadStatus: 'exception',
                  isWaitDownload: false,
                  isDownloading: false,
                  errLog: '文件内容不合法,请重新下载安装'
                }
                store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
                  reject('文件内容不合法,请重新下载安装')
                })
              } else {
                var package_json = fse.readJsonSync(packagePath)
                if (package_json.language === 'nodejs') {
                  let targetPath = path.normalize(`${pluginPath}${folderName}/${options.plugin.isUiautoBaseIntegration ? '' : fse.readJsonSync(packagePath).version}`)
                  fse.move(folderPath, targetPath, {
                    overwrite: true
                  }, err => {
                    //fse.copy(folderPath, `${pluginPath}${folderName}/${options.plugin.isUiautoBaseIntegration ? '' : fse.readJsonSync(packagePath).version}`, err => {
                    if (err) {
                      const downloadParams = {
                        plugin_id: options.plugin.plugin_id,
                        version: options.plugin.version,
                        // downloadRate: 90,
                        downloadStatus: 'exception',
                        isWaitDownload: false,
                        isDownloading: false,
                        errLog: '文件安装出错'
                      }
                      store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
                        fse.remove(folderPath)
                        fse.remove(targetPath)
                        fse.remove(resultPath)
                        fse.remove(pluginTempPath)
                        reject(err)
                      })
                    } else {
                      nodeInit(targetPath)
                        .then(returnVaule => {
                          console.log('nodeInit success')
                          const downloadParams = {
                            plugin_id: options.plugin.plugin_id,
                            version: options.plugin.version,
                            downloadRate: 100,
                            downloadStatus: 'success',
                            isWaitDownload: false,
                            isDownloading: false
                          }
                          store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
                            fse.remove(folderPath)
                            fse.remove(resultPath)
                            fse.remove(pluginTempPath)
                            resolve(options.plugin)
                          })
                        })
                        .catch(err => {
                          console.log('nodeInit error')
                          console.log(err)
                          const downloadParams = {
                            plugin_id: options.plugin.plugin_id,
                            version: options.plugin.version,
                            // downloadRate: 90,
                            downloadStatus: 'exception',
                            isWaitDownload: false,
                            isDownloading: false,
                            errLog: '依赖安装出错'
                          }
                          store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
                            fse.remove(folderPath)
                            fse.remove(targetPath)
                            fse.remove(resultPath)
                            fse.remove(pluginTempPath)
                            reject(err)
                          })
                        })
                    }
                  })
                } else if (package_json.language === 'python') {
                  console.log(options.plugin)
                  pythonInit(folderPath, package_json.version)
                    .then(returnVaule => {
                      console.log('pythonInit success')
                      // fse.moveSync(folderPath, `${pluginPath}${folderName}/${options.plugin.isUiautoBaseIntegration ? '' : fse.readJsonSync(packagePath).version}`, {
                      //   overwrite: true
                      // })
                      // fse.copySync(
                      //   folderPath,
                      //   `${pluginPath}${folderName}/${options.plugin.isUiautoBaseIntegration ? '' : fse.readJsonSync(packagePath).version}`
                      // );
                      fse.move(folderPath, path.normalize(`${pluginPath}${folderName}/${options.plugin.isUiautoBaseIntegration ? '' : fse.readJsonSync(packagePath).version}`), {
                        overwrite: true
                      }, err => {
                        //fse.copy(folderPath, `${pluginPath}${folderName}/${options.plugin.isUiautoBaseIntegration ? '' : fse.readJsonSync(packagePath).version}`, err => {
                        if (err) {
                          const downloadParams = {
                            plugin_id: options.plugin.plugin_id,
                            version: options.plugin.version,
                            // downloadRate: 90,
                            downloadStatus: 'exception',
                            isWaitDownload: false,
                            isDownloading: false,
                            errLog: '文件安装出错'
                          }
                          store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
                            fse.remove(folderPath)
                            fse.remove(resultPath)
                            fse.remove(pluginTempPath)
                            reject(err)
                          })
                        } else {
                          const downloadParams = {
                            plugin_id: options.plugin.plugin_id,
                            version: options.plugin.version,
                            // downloadRate: 100,
                            isDownloading: false,
                            isWaitDownload: false,
                            downloadStatus: 'success'
                          }
                          store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
                            fse.remove(folderPath)
                            fse.remove(resultPath)
                            fse.remove(pluginTempPath)
                            resolve(options.plugin)
                          })
                        }
                      })

                    })
                    .catch(err => {
                      console.log('pythonInit error')
                      console.log(err)
                      const downloadParams = {
                        plugin_id: options.plugin.plugin_id,
                        version: options.plugin.version,
                        // downloadRate: 90,
                        downloadStatus: 'exception',
                        isWaitDownload: false,
                        isDownloading: false,
                        errLog: '依赖安装出错'
                      }
                      store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
                        fse.remove(folderPath)
                        fse.remove(resultPath)
                        fse.remove(pluginTempPath)
                        reject(err)
                      })
                    })
                } else if (package_json.language === 'java') {
                  // fse.moveSync(folderPath, `${pluginPath}${folderName}/${fse.readJsonSync(packagePath).version}`, {
                  //   overwrite: true
                  // })
                  // fse.copySync(
                  //   folderPath,
                  //   `${pluginPath}${folderName}/${options.plugin.isUiautoBaseIntegration ? '' : fse.readJsonSync(packagePath).version}`
                  // );
                  fse.move(folderPath, path.normalize(`${pluginPath}${folderName}/${options.plugin.isUiautoBaseIntegration ? '' : fse.readJsonSync(packagePath).version}`), {
                    overwrite: true
                  }, err => {
                    // fse.copy(folderPath, `${pluginPath}${folderName}/${options.plugin.isUiautoBaseIntegration ? '' : fse.readJsonSync(packagePath).version}`, err => {
                    if (err) {
                      const downloadParams = {
                        plugin_id: options.plugin.plugin_id,
                        version: options.plugin.version,
                        // downloadRate: 90,
                        downloadStatus: 'exception',
                        isWaitDownload: false,
                        isDownloading: false,
                        errLog: '文件安装出错'
                      }
                      store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
                        fse.remove(folderPath)
                        fse.remove(resultPath)
                        fse.remove(pluginTempPath)
                        reject(err)
                      })
                    } else {
                      const downloadParams = {
                        plugin_id: options.plugin.plugin_id,
                        version: options.plugin.version,
                        // downloadRate: 100,
                        isDownloading: false,
                        isWaitDownload: false,
                        downloadStatus: 'success'
                      }
                      store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
                        fse.remove(folderPath)
                        fse.remove(resultPath)
                        fse.remove(pluginTempPath)
                        resolve(options.plugin)
                      })
                    }
                  })
                } else {
                  fse.remove(folderPath)
                  fse.remove(resultPath)
                  fse.remove(pluginTempPath)
                  const downloadParams = {
                    plugin_id: options.plugin.plugin_id,
                    version: options.plugin.version,
                    // downloadRate: 90,
                    downloadStatus: 'exception',
                    isWaitDownload: false,
                    isDownloading: false,
                    errLog: '文件格式有误，language需为一种有效语言'
                  }
                  store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
                    reject('文件格式有误，language需为一种有效语言')
                  })
                }
              }
            })
          }).catch(err => {
            console.log('decompress err')
            console.log(err)
            const downloadParams = {
              plugin_id: options.plugin.plugin_id,
              version: options.plugin.version,
              // downloadRate: 90,
              downloadStatus: 'exception',
              isWaitDownload: false,
              isDownloading: false,
              errLog: '文件解压出错'
            }
            store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
              fse.remove(folderPath)
              fse.remove(resultPath)
              fse.remove(pluginTempPath)
              reject('文件解压出错')
            })
          })
        } else {
          const downloadParams = {
            plugin_id: options.plugin.plugin_id,
            version: options.plugin.version,
            // downloadRate: 90,
            downloadStatus: 'exception',
            isWaitDownload: false,
            isDownloading: false,
            errLog: '文件下载不完整或文件受损,请重新下载安装'
          }
          store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
            fse.remove(resultPath)
            reject('文件下载不完整或文件受损,请重新下载安装')
          })
        }
      } else {
        const downloadParams = {
          plugin_id: options.plugin.plugin_id,
          version: options.plugin.version,
          // downloadRate: 80,
          downloadStatus: 'exception',
          isWaitDownload: false,
          isDownloading: false,
          errLog: '找不到目标文件,请重新下载安装'
        }
        store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
          reject('找不到目标文件,请重新下载安装')
        })
      }
      // const downloadParams = {
      //   plugin_id: options.plugin.plugin_id,
      //   version: options.plugin.version,
      //   downloadRate: (/^100$|^(\d|[1-9]\d)(\.\d+)*$/).test(result.progress) == true ? result.progress : 0,
      //   downloadStatus: null,
      //   // downloadStatus: (/^100$|^(\d|[1-9]\d)(\.\d+)*$/).test(result.progress) == true ? null : 'exception',
      //   isWaitDownload: false,
      //   isDownloading: (/^100$|^(\d|[1-9]\d)(\.\d+)*$/).test(result.progress) == true
      // }
      // store.commit('plugin/PLUGIN_DOWNLOAD', downloadParams)
      // if (result.state == 'interrupted' || result.state == 'cancelled') {
      //   ipc.removeAllListeners([options.listener_name])
      //   console.log('$$$$$$')
      //   console.log(options)
      //   console.log(result)
      //   const downloadParams = {
      //     plugin_id: options.plugin.plugin_id,
      //     version: options.plugin.version,
      //     downloadRate: (/^100$|^(\d|[1-9]\d)(\.\d+)*$/).test(result.progress) == true ? result.progress : 80,
      //     downloadStatus: 'exception',
      //     isWaitDownload: false,
      //     isDownloading: false,
      //     errLog: '文件下载失败,请重新下载安装'
      //   }
      //   store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
      //     // if (fse.existsSync(result.filePath)) {
      //     //   fse.unlinkSync(result.filePath)
      //     // }
      //     reject('文件下载失败,请重新下载安装')
      //   })
      // }
      // if (result.state == 'completed') {
      //   // console.log(options)
      //   ipc.removeAllListeners([options.listener_name])
      //   // var pluginPath = path.normalize(
      //   //   path.resolve() + "/.." + "/web/public/plugins/"
      //   // path.resolve() + "/.." + "/"
      //   // );
      //   // var pluginTempPath = path.normalize(
      //   //   path.resolve() + "/.." + "/web/public/plugins_temp/"
      //   // path.resolve() + "/.." + "/web/"
      //   // );
      //   const base_integration_path = path.normalize(path.join(path.resolve(), '/public/base_integration/'))
      //   var pluginPath = ''
      //   if (options.plugin.isUiautoBaseIntegration) {
      //     pluginPath = base_integration_path
      //   } else {
      //     pluginPath = path.normalize(config.pluginsPath + '/')
      //   }
      //   var pluginTempPath = path.normalize(`${config.pluginsPath}/../plugins_temp/`)
      //   var folderPath = ''
      //   if (fse.existsSync(result.filePath)) {

      //     const fileContent = fse.readFileSync(result.filePath)
      //     const hashId = crypto.createHash('md5').update(fileContent).digest('hex')
      //     // console.log('hashId', hashId)
      //     // console.log(options.plugin)
      //     if (options.plugin.attachmentMd5 != null && options.plugin.attachmentMd5 === hashId) {
      //       decompress(result.filePath, pluginTempPath, {
      //         filter: function (file) {
      //           var r = true;
      //           if (file.path.startsWith("__MACOSX")) {
      //             r = false;
      //           }
      //           if (file.type === 'file' && file.path.endsWith('/')) {
      //             file.type = 'directory'
      //           }
      //           return r;
      //         }
      //       }).then(files => {
      //         console.log('decompress success')
      //         const downloadParams = {
      //           plugin_id: options.plugin.plugin_id,
      //           version: options.plugin.version,
      //           downloadRate: 90,
      //           downloadStatus: null,
      //           isWaitDownload: false,
      //           isDownloading: true
      //         }
      //         store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
      //           var folderName = files[0].path.split('/')[0]
      //           folderPath = path.normalize(pluginTempPath + folderName)
      //           var packagePath = path.normalize(folderPath + '/' + 'package.json')
      //           if (!fse.existsSync(folderPath) ||
      //             !fse.existsSync(packagePath)) {
      //             fse.unlinkSync(result.filePath)
      //             fse.emptyDirSync(folderPath)
      //             fse.rmdirSync(folderPath)
      //             const downloadParams = {
      //               plugin_id: options.plugin.plugin_id,
      //               version: options.plugin.version,
      //               downloadRate: 90,
      //               downloadStatus: 'exception',
      //               isWaitDownload: false,
      //               isDownloading: false,
      //               errLog: '文件内容不合法,请重新下载安装'
      //             }
      //             store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
      //               reject('文件内容不合法,请重新下载安装')
      //             })
      //           } else {
      //             var package_json = fse.readJsonSync(packagePath)
      //             if (package_json.language === 'nodejs') {
      //               nodeInit(folderPath)
      //                 .then(returnVaule => {
      //                   console.log('nodeInit success')
      //                   // console.log(fse.readJsonSync(packagePath).dependencies)
      //                   // console.log(folderPath)
      //                   // fse.moveSync(folderPath, `${pluginPath}${folderName}/${options.plugin.isUiautoBaseIntegration ? '' : fse.readJsonSync(packagePath).version}`, {
      //                   //   overwrite: true
      //                   // })
      //                   fse.copySync(
      //                     folderPath,
      //                     `${pluginPath}${folderName}/${options.plugin.isUiautoBaseIntegration ? '' : fse.readJsonSync(packagePath).version}`
      //                   );
      //                   const downloadParams = {
      //                     plugin_id: options.plugin.plugin_id,
      //                     version: options.plugin.version,
      //                     downloadRate: 100,
      //                     downloadStatus: 'success',
      //                     isWaitDownload: false,
      //                     isDownloading: false
      //                   }
      //                   store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
      //                     fse.emptyDirSync(folderPath)
      //                     fse.rmdirSync(folderPath)
      //                     fse.unlinkSync(result.filePath)
      //                     resolve(options.plugin)
      //                   })
      //                 })
      //                 .catch(err => {
      //                   console.log('nodeInit error')
      //                   console.log(err)
      //                   const downloadParams = {
      //                     plugin_id: options.plugin.plugin_id,
      //                     version: options.plugin.version,
      //                     downloadRate: 90,
      //                     downloadStatus: 'exception',
      //                     isWaitDownload: false,
      //                     isDownloading: false,
      //                     errLog: '依赖安装出错'
      //                   }
      //                   store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
      //                     fse.emptyDirSync(folderPath)
      //                     fse.rmdirSync(folderPath)
      //                     fse.unlinkSync(result.filePath)
      //                     reject(err)
      //                   })
      //                 })
      //             } else if (package_json.language === 'python') {
      //               pythonInit(folderPath, package_json.version)
      //                 .then(returnVaule => {
      //                   console.log('pythonInit success')
      //                   // fse.moveSync(folderPath, `${pluginPath}${folderName}/${options.plugin.isUiautoBaseIntegration ? '' : fse.readJsonSync(packagePath).version}`, {
      //                   //   overwrite: true
      //                   // })
      //                   fse.copySync(
      //                     folderPath,
      //                     `${pluginPath}${folderName}/${options.plugin.isUiautoBaseIntegration ? '' : fse.readJsonSync(packagePath).version}`
      //                   );
      //                   const downloadParams = {
      //                     plugin_id: options.plugin.plugin_id,
      //                     version: options.plugin.version,
      //                     downloadRate: 100,
      //                     isDownloading: false,
      //                     isWaitDownload: false,
      //                     downloadStatus: 'success'
      //                   }
      //                   store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
      //                     fse.emptyDirSync(folderPath)
      //                     fse.rmdirSync(folderPath)
      //                     fse.unlinkSync(result.filePath)
      //                     resolve(options.plugin)
      //                   })
      //                 })
      //                 .catch(err => {
      //                   console.log('pythonInit error')
      //                   console.log(err)
      //                   const downloadParams = {
      //                     plugin_id: options.plugin.plugin_id,
      //                     version: options.plugin.version,
      //                     downloadRate: 90,
      //                     downloadStatus: 'exception',
      //                     isWaitDownload: false,
      //                     isDownloading: false,
      //                     errLog: '依赖安装出错'
      //                   }
      //                   store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
      //                     fse.emptyDirSync(folderPath)
      //                     fse.rmdirSync(folderPath)
      //                     fse.unlinkSync(result.filePath)
      //                     reject(err)
      //                   })
      //                 })
      //             } else if (package_json.language === 'java') {
      //               // fse.moveSync(folderPath, `${pluginPath}${folderName}/${fse.readJsonSync(packagePath).version}`, {
      //               //   overwrite: true
      //               // })
      //               fse.copySync(
      //                 folderPath,
      //                 `${pluginPath}${folderName}/${options.plugin.isUiautoBaseIntegration ? '' : fse.readJsonSync(packagePath).version}`
      //               );
      //               const downloadParams = {
      //                 plugin_id: options.plugin.plugin_id,
      //                 version: options.plugin.version,
      //                 downloadRate: 100,
      //                 isDownloading: false,
      //                 isWaitDownload: false,
      //                 downloadStatus: 'success'
      //               }
      //               store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
      //                 fse.emptyDirSync(folderPath)
      //                 fse.rmdirSync(folderPath)
      //                 fse.unlinkSync(result.filePath)
      //                 resolve(options.plugin)
      //               })
      //             } else {
      //               fse.emptyDirSync(folderPath)
      //               fse.rmdirSync(folderPath)
      //               fse.unlinkSync(result.filePath)
      //               const downloadParams = {
      //                 plugin_id: options.plugin.plugin_id,
      //                 version: options.plugin.version,
      //                 downloadRate: 90,
      //                 downloadStatus: 'exception',
      //                 isWaitDownload: false,
      //                 isDownloading: false,
      //                 errLog: '文件格式有误，language需为一种有效语言'
      //               }
      //               store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
      //                 reject('文件格式有误，language需为一种有效语言')
      //               })
      //             }
      //           }
      //         })
      //       }).catch(err => {
      //         console.log('decompress err')
      //         console.log(err)
      //         const downloadParams = {
      //           plugin_id: options.plugin.plugin_id,
      //           version: options.plugin.version,
      //           downloadRate: 90,
      //           downloadStatus: 'exception',
      //           isWaitDownload: false,
      //           isDownloading: false,
      //           errLog: '文件解压出错'
      //         }
      //         store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
      //           if (fse.existsSync(folderPath)) {
      //             fse.emptyDirSync(folderPath)
      //             fse.rmdirSync(folderPath)
      //           }
      //           fse.unlinkSync(result.filePath)
      //           reject('文件解压出错')
      //         })
      //       })
      //     } else {
      //       const downloadParams = {
      //         plugin_id: options.plugin.plugin_id,
      //         version: options.plugin.version,
      //         downloadRate: 90,
      //         downloadStatus: 'exception',
      //         isWaitDownload: false,
      //         isDownloading: false,
      //         errLog: '文件下载不完整或文件受损,请重新下载安装'
      //       }
      //       store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
      //         // fse.unlinkSync(result.filePath)
      //         reject('文件下载不完整或文件受损,请重新下载安装')
      //       })
      //     }
      //   } else {
      //     const downloadParams = {
      //       plugin_id: options.plugin.plugin_id,
      //       version: options.plugin.version,
      //       downloadRate: 80,
      //       downloadStatus: 'exception',
      //       isWaitDownload: false,
      //       isDownloading: false,
      //       errLog: '找不到目标文件,请重新下载安装'
      //     }
      //     store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
      //       reject('找不到目标文件,请重新下载安装')
      //     })
      //   }
      // }
    }).catch(error => {
      console.log("download error")
      console.log(error)
      const downloadParams = {
        plugin_id: options.plugin.plugin_id,
        version: options.plugin.version,
        downloadStatus: 'exception',
        isWaitDownload: false,
        isDownloading: false,
        errLog: '文件下载失败,请重新下载安装'
      }
      store.dispatch('plugin/pluginDownload', downloadParams).then(plugin_cache => {
        reject('文件下载失败,请重新下载安装')
      })
    })
  })
}
export function window_maximize() {
  ipc.send('window_maximize', null)
}
export function window_minimize() {
  ipc.send('window_minimize', null)
}
export function window_setContentSize() {
  ipc.send('window_setContentSize', null)
}
export function dependencyDownload(options = {}) {
  return new Promise((resolve, reject) => {
    resolve('success')
    // ipc.send('download', options)
    // ipc.on(options.listener_name, function (event, result) {
    //   if (result.state == 'interrupted' || result.state == 'cancelled') {
    //     ipc.removeAllListeners([options.listener_name])
    //     fse.remove(result.filePath)
    //     reject('文件下载失败,请重新下载安装')
    //   }
    //   if (result.state == 'completed') {
    //     ipc.removeAllListeners([options.listener_name])
    //     const downloadParams = {
    //       name: options.dependency.name,
    //       downloading: false,
    //       isdownloaded: true,
    //       filePath: result.filePath
    //     }
    //     store.dispatch('dependency/dependencyDownload', downloadParams).then(plugin_cache => {
    //       resolve('success')
    //     })
    //     //   exec("open " + result.filePath, (err, stdout, stderr) => {
    //     //     if (err != null) {
    //     //       reject(err)
    //     //   } else {
    //     //     resolve(stdout)
    //     //   }
    //     // })
    //   }
    // })
  })
}
