/*
 * @Author: chenzy
 * @LastEditors: chenzy
 * @Date: 2019-07-17 13:07:26
 * @LastEditTime: 2019-08-28 13:52:46
 * @Description: file content
 */
var ipc = window.require('electron').ipcRenderer
var decompress = window.require("decompress");
const path = window.require("path");
const {
  exec,
  spawn
} = window.require('child_process');
var fse = window.require("fs-extra");
var fs = window.require("fs");
var crypto = window.require('crypto');
var { nodeInit, pythonInit } = require("@/utils/init.js");
import store from '@/store'
import environment from "@/config/environment";
import config from "@/config/environment/index";

export function fileSelector(options = {}) {
  return new Promise((reslove, reject) => {
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

      reslove(result)
    })
  })
}
function tco(f) {
  var value;
  var active = false;
  var accumulated = [];
  return function accumulator() {
    accumulated.push(arguments);
    if (!active) {
      active = true;
      while (accumulated.length) {
        value = f.apply(this, accumulated.shift());
      }
      active = false;
      return value;
    }
  };
}


export const executeDownload = function (plugin) {
  return new Promise((reslove, reject) => {
    const downloadParams = {
      plugin_id: plugin.plugin_id,
      downloadRate: 0,
      downloadStatus: "text",
      isWaitDownload: false,
      isDownloading: true,
      is_uiauto_base_integration: !!plugin.is_uiauto_base_integration
    };
    store
      .dispatch("plugin/pluginDownload", downloadParams)
      .then(result => {
        const thePluginStatus = {
          plugin_id: plugin.plugin_id,
          needUpdate: true,
          buttonText: "正在下载"
        };
        store
          .dispatch("plugin/pluginStatus", thePluginStatus)
          .then(pluginStatus => {
            console.warn("正在下载");
            pluginDownload({
              plugin: plugin,
              listener_name: `downstate${plugin.plugin_id}@${plugin.latestVersion}`,
              downloadPath: `${environment.serverUrl}/downloads/plugins/${plugin.plugin_id}/${plugin.plugin_id}@${plugin.latestVersion}`,
              configPath: path.normalize(`${config.pluginsPath}/../plugins_temp/`)
            })
              .then(result => {
                console.warn(result);
                store
                  .dispatch("plugin/pluginDownloadDelete", plugin.plugin_id)
                  .then(pluginDownloadDelete => {
                    console.warn(`${plugin.plugin_id}已安装最新版本`);
                    const thePluginStatus = {
                      plugin_id: plugin.plugin_id,
                      needUpdate: false,
                      buttonText: "已安装最新版本"
                    };
                    store
                      .dispatch("plugin/pluginStatus", thePluginStatus)
                      .then(pluginStatus => {
                        console.warn("pluginStatus");
                        reslove(result);
                      });
                    if (plugin.language === "python") {
                      store.commit(
                        "plugin/MARK_PYTHON_DOWNLOADING",
                        false
                      );
                    }
                  });
              })
              .catch(err => {
                console.warn("pluginDownload err");
                console.warn(err);
                const thePluginStatus = {
                  plugin_id: plugin.plugin_id,
                  needUpdate: true,
                  buttonText: "重新下载"
                };
                if (plugin.language === "python") {
                  store.commit(
                    "plugin/MARK_PYTHON_DOWNLOADING",
                    false
                  );
                }
                store
                  .dispatch("plugin/pluginStatus", thePluginStatus)
                  .then(the_result => {
                    reject(err);
                  });
              });
          });
      })
      .catch(err => {
        const thePluginStatus = {
          plugin_id: plugin.plugin_id,
          needUpdate: true,
          buttonText: "重新下载"
        };
        if (plugin.language === "python") {
          store.commit("plugin/MARK_PYTHON_DOWNLOADING", false);
        }
        store
          .dispatch("plugin/pluginStatus", thePluginStatus)
          .then(the_result => {
            reject(err);
          });
      });
  });
}

export const allDownload = tco(function (webPlugin, index, downloaded = [], notDownloaded = [], total = 0) {
  console.warn("allDownload  download_plugin");
  console.warn(webPlugin);
  if (
    index === webPlugin.length &&
    downloaded.length === webPlugin.length
  ) {
    console.warn("allDownload  END");
    store.commit("plugin/ALL_PLUGIN_DOWNLOADING", false);
  } else if (
    index === webPlugin.length &&
    downloaded.length < webPlugin.length
  ) {
    if (store.state.plugin.has_python_downloading) {
      if (total > 5) {
        console.warn("allDownload total > 5");
        console.warn(notDownloaded);
        _.each(notDownloaded, (notDownloadedItem, idx) => {
          let downloadParams = {
            plugin_id: notDownloadedItem.plugin_id,
            downloadRate: 90,
            downloadStatus: 'exception',
            isWaitDownload: false,
            isDownloading: false,
            errLog: "等待下载时间超时"
          }
          let statusParams = {
            plugin_id: notDownloadedItem.plugin_id,
            needUpdate: true,
            buttonText: "重新下载"
          };
          store.commit("plugin/PLUGIN_DOWNLOAD", downloadParams)
          store.commit("plugin/PLUGIN_STATUS", statusParams)
        })

      } else {
        setTimeout(() => {
          console.warn("allDownload setTimeout 10000");
          total++;
          allDownload(webPlugin, index, downloaded, notDownloaded, total);
        }, 10000);
      }

    } else {
      store.commit("plugin/MARK_PYTHON_DOWNLOADING", true);
      executeDownload(notDownloaded[0])
        .then(result => {
          downloaded.push(notDownloaded[0]);
          _.remove(notDownloaded, function (item) {
            return item == notDownloaded[0];
          });
          allDownload(webPlugin, index, downloaded, notDownloaded);
        })
        .catch(err => {
          downloaded.push(notDownloaded[0]);
          _.remove(notDownloaded, function (item) {
            return item == notDownloaded[0];
          });
          allDownload(webPlugin, index, downloaded, notDownloaded);
        });
    }
  } else {
    console.warn("allDownload downloading");
    console.warn(index);
    console.warn(webPlugin);
    let webPlugin_param = webPlugin[index];
    // console.warn(webPlugin_param);
    if (webPlugin_param.language === "python") {
      if (store.state.plugin.has_python_downloading) {
        notDownloaded.push(webPlugin_param);
        index++;
        allDownload(webPlugin, index, downloaded, notDownloaded);
      } else {
        store.commit("plugin/MARK_PYTHON_DOWNLOADING", true);
        executeDownload(webPlugin_param)
          .then(result => {
            downloaded.push(webPlugin_param);
            index++;
            allDownload(webPlugin, index, downloaded, notDownloaded);
          })
          .catch(err => {
            downloaded.push(webPlugin_param);
            index++;
            allDownload(webPlugin, index, downloaded, notDownloaded);
          });
      }
    } else {
      executeDownload(webPlugin_param)
        .then(result => {
          downloaded.push(webPlugin_param);
          index++;
          allDownload(webPlugin, index, downloaded, notDownloaded);
        })
        .catch(err => {
          downloaded.push(webPlugin_param);
          index++;
          allDownload(webPlugin, index, downloaded, notDownloaded);
        });
    }
  }
})

export function pluginDownload(options = {}) {
  return new Promise((resolve, reject) => {
    ipc.send('download', options)
    ipc.on(options.listener_name, function (event, result) {
      console.log("###########")
      console.log(result)
      const downloadParams = {
        plugin_id: options.plugin.plugin_id,
        downloadRate: (/^100$|^(\d|[1-9]\d)(\.\d+)*$/).test(result.progress) == true ? result.progress : 80,
        downloadStatus: (/^100$|^(\d|[1-9]\d)(\.\d+)*$/).test(result.progress) == true ? 'text' : 'exception',
        isWaitDownload: false,
        isDownloading: (/^100$|^(\d|[1-9]\d)(\.\d+)*$/).test(result.progress) == true ? true : false
      }
      store.dispatch("plugin/pluginDownload", downloadParams).then(plugin_cache => {
        if (result.state == 'interrupted' || result.state == 'cancelled') {
          ipc.removeAllListeners([options.listener_name])
          console.log("$$$$$$")
          console.log(options)
          console.log(result)
          const downloadParams = {
            plugin_id: options.plugin.plugin_id,
            downloadRate: (/^100$|^(\d|[1-9]\d)(\.\d+)*$/).test(result.progress) == true ? result.progress : 80,
            downloadStatus: 'exception',
            isWaitDownload: false,
            isDownloading: false,
            errLog: "文件下载失败,请重新下载安装"
          }
          store.dispatch("plugin/pluginDownload", downloadParams).then(plugin_cache => {
            if (fs.existsSync(result.filePath)) {
              fs.unlinkSync(result.filePath)
              reject("文件下载失败,请重新下载安装")
            }
          })
        }
        if (result.state == 'completed') {
          console.log(options);
          ipc.removeAllListeners([options.listener_name])
          // var pluginPath = path.normalize(
          //   path.resolve() + "/.." + "/web/public/plugins/"
          // path.resolve() + "/.." + "/"
          // );
          // var pluginTempPath = path.normalize(
          //   path.resolve() + "/.." + "/web/public/plugins_temp/"
          // path.resolve() + "/.." + "/web/"
          // );
          const base_integration_path = path.join(path.resolve(), '/public/base_integration/');
          var pluginPath = '';
          if (!!options.plugin.is_uiauto_base_integration) {
            pluginPath = base_integration_path;
          } else {
            pluginPath = config.pluginsPath + '/';
          }
          var pluginTempPath = path.normalize(`${config.pluginsPath}/../plugins_temp/`)
          const fileContent = fs.readFileSync(result.filePath)
          var hashId = crypto.createHash('md5').update(fileContent).digest('hex')
          console.log('hashId', hashId)
          console.log(result.filePath)
          // console.log(pluginPath)
          if (options.plugin.attachment_md5 != null && options.plugin.attachment_md5 === hashId) {
            decompress(result.filePath, pluginTempPath, {
              filter: function (file) {
                var r = true;
                if (file.path.startsWith("__MACOSX")) {
                  r = false;
                }
                return r;
              }
            }).then(files => {
              const downloadParams = {
                plugin_id: options.plugin.plugin_id,
                downloadRate: 90,
                downloadStatus: 'text',
                isWaitDownload: false,
                isDownloading: true
              }
              store.dispatch("plugin/pluginDownload", downloadParams).then(plugin_cache => {
                var folderName = files[0].path.split("/")[0];
                var folderPath = pluginTempPath + folderName;
                var packagePath = folderPath + "/" + "package.json";
                if (!fs.existsSync(folderPath) ||
                  !fs.existsSync(packagePath)) {
                  fs.unlinkSync(result.filePath)
                  fse.emptyDirSync(folderPath);
                  fs.rmdirSync(folderPath);
                  const downloadParams = {
                    plugin_id: options.plugin.plugin_id,
                    downloadRate: 90,
                    downloadStatus: 'exception',
                    isWaitDownload: false,
                    isDownloading: false,
                    errLog: "文件内容不合法,请重新下载安装"
                  }
                  store.dispatch("plugin/pluginDownload", downloadParams).then(plugin_cache => {
                    reject("文件内容不合法,请重新下载安装")
                  })
                } else {
                  var package_json = fse.readJsonSync(packagePath);
                  if (package_json.language === "nodejs") {
                    nodeInit(folderPath)
                      .then(returnVaule => {
                        console.log("nodeInit success")
                        console.log(fse.readJsonSync(packagePath).dependencies)
                        console.log(folderPath)
                        fse.moveSync(folderPath, `${pluginPath}${folderName}/${fse.readJsonSync(packagePath).version}`, { overwrite: true });
                        const downloadParams = {
                          plugin_id: options.plugin.plugin_id,
                          downloadRate: 100,
                          downloadStatus: 'success',
                          isWaitDownload: false,
                          isDownloading: false
                        }
                        store.dispatch("plugin/pluginDownload", downloadParams).then(plugin_cache => {
                          fse.emptyDirSync(folderPath);
                          fs.rmdirSync(folderPath);
                          fs.unlinkSync(result.filePath)
                          resolve(options.plugin);
                        })
                      })
                      .catch(err => {
                        console.log("nodeInit error")
                        console.log(err)
                        const downloadParams = {
                          plugin_id: options.plugin.plugin_id,
                          downloadRate: 90,
                          downloadStatus: 'exception',
                          isWaitDownload: false,
                          isDownloading: false,
                          errLog: "依赖安装出错"
                        }
                        store.dispatch("plugin/pluginDownload", downloadParams).then(plugin_cache => {
                          fse.emptyDirSync(folderPath);
                          fs.rmdirSync(folderPath);
                          fs.unlinkSync(result.filePath);
                          reject(err)
                        })
                      });
                  } else if (package_json.language === "python") {
                    pythonInit(folderPath, package_json.python_version)
                      .then(returnVaule => {
                        console.log("pythonInit success")
                        fse.moveSync(folderPath, `${pluginPath}${folderName}/${fse.readJsonSync(packagePath).version}`, { overwrite: true });
                        const downloadParams = {
                          plugin_id: options.plugin.plugin_id,
                          downloadRate: 100,
                          isDownloading: false,
                          isWaitDownload: false,
                          downloadStatus: 'success'
                        }
                        store.dispatch("plugin/pluginDownload", downloadParams).then(plugin_cache => {
                          fse.emptyDirSync(folderPath);
                          fs.rmdirSync(folderPath);
                          fs.unlinkSync(result.filePath);
                          resolve(options.plugin);
                        })
                      })
                      .catch(err => {
                        console.log("pythonInit error")
                        console.log(err)
                        const downloadParams = {
                          plugin_id: options.plugin.plugin_id,
                          downloadRate: 90,
                          downloadStatus: 'exception',
                          isWaitDownload: false,
                          isDownloading: false,
                          errLog: "依赖安装出错"
                        }
                        store.dispatch("plugin/pluginDownload", downloadParams).then(plugin_cache => {
                          fse.emptyDirSync(folderPath);
                          fs.rmdirSync(folderPath);
                          fs.unlinkSync(result.filePath);
                          reject(err)
                        })
                      });
                  } else if (package_json.language === "java") {
                    fse.moveSync(folderPath, `${pluginPath}${folderName}/${fse.readJsonSync(packagePath).version}`, { overwrite: true });
                    const downloadParams = {
                      plugin_id: options.plugin.plugin_id,
                      downloadRate: 100,
                      isDownloading: false,
                      isWaitDownload: false,
                      downloadStatus: 'success'
                    }
                    store.dispatch("plugin/pluginDownload", downloadParams).then(plugin_cache => {
                      fse.emptyDirSync(folderPath);
                      fs.rmdirSync(folderPath);
                      fs.unlinkSync(result.filePath);
                      resolve(options.plugin);
                    })
                  } else {
                    fse.emptyDirSync(folderPath);
                    fs.rmdirSync(folderPath);
                    fs.unlinkSync(result.filePath)
                    const downloadParams = {
                      plugin_id: options.plugin.plugin_id,
                      downloadRate: 90,
                      downloadStatus: 'exception',
                      isWaitDownload: false,
                      isDownloading: false,
                      errLog: "文件格式有误，language需为一种有效语言"
                    }
                    store.dispatch("plugin/pluginDownload", downloadParams).then(plugin_cache => {
                      reject("文件格式有误，language需为一种有效语言")
                    })
                  }
                }
              })
            }).catch(err => {
              console.log("decompress err")
              console.log(err)
              const downloadParams = {
                plugin_id: options.plugin.plugin_id,
                downloadRate: 90,
                downloadStatus: 'exception',
                isWaitDownload: false,
                isDownloading: false,
                errLog: "文件解压出错"
              }
              store.dispatch("plugin/pluginDownload", downloadParams).then(plugin_cache => {
                if (fs.existsSync(folderPath)) {
                  fse.emptyDirSync(folderPath);
                  fs.rmdirSync(folderPath);
                }
                fs.unlinkSync(result.filePath)
                reject("文件解压出错")
              })
            })
          } else {
            const downloadParams = {
              plugin_id: options.plugin.plugin_id,
              downloadRate: 90,
              downloadStatus: 'exception',
              isWaitDownload: false,
              isDownloading: false,
              errLog: "文件下载不完整或文件受损,请重新下载安装"
            }
            store.dispatch("plugin/pluginDownload", downloadParams).then(plugin_cache => {
              fs.unlinkSync(result.filePath)
              reject("文件下载不完整或文件受损,请重新下载安装")
            })
          }
        }
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
export function dependencyDownload(options = {}) {
  return new Promise((resolve, reject) => {
    ipc.send('download', options)
    console.log("dependencyDownload")
    console.log(options)
    ipc.on(options.listener_name, function (event, result) {
      console.log("dependencyDownload")
      console.log(result)
      if (result.state == 'interrupted' || result.state == 'cancelled') {
        ipc.removeAllListeners([options.listener_name])
        console.log("dependencyDownload faild")
        console.log(options)
        console.log(result)
        if (fs.existsSync(result.filePath)) {
          fs.unlinkSync(result.filePath)
          reject("文件下载失败,请重新下载安装")
        }
      }
      if (result.state == 'completed') {
        console.log("dependencyDownload completed")
        console.log(options)
        console.log(result)
        ipc.removeAllListeners([options.listener_name])
        let downloadParams = {
          name: options.dependency.name,
          downloading: false,
          isdownloaded: true,
          filePath: result.filePath
        };
        store.dispatch("dependency/dependencyDownload", downloadParams).then(plugin_cache => {
          resolve("success")
        })
        //   exec("open " + result.filePath, (err, stdout, stderr) => {
        //     if (err != null) {
        //       reject(err)
        //   } else {
        //     resolve(stdout)
        //   }
        // })
      }
    })
  })
}
