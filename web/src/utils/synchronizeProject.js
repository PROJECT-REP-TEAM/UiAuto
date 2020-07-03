/*
 * @Author: chenzy
 * @LastEditors: chenzy
 * @Date: 2019-08-20 20:19:40
 * @LastEditTime: 2019-08-26 15:44:34
 * @Description: file content
 */
var ipc = window.require('electron').ipcRenderer
var decompress = window.require("decompress");
const path = window.require("path");
var fse = window.require("fs-extra");
var fs = window.require("fs");
const moment = window.require('moment');
var { pluginDownload } = require("@/utils/electron.js");
import store from '@/store';
import { Notification } from 'element-ui';
import config from "@/config/environment/index";
import environment from "@/config/environment";
import { pluginViews } from "@/api/plugin";

export function getSynchronizeParams(data = []) {
    let needSynchronizeProjects = [];
    let file_name_list = _.difference(fs.readdirSync(config.projectsPath), ['.DS_Store']);
    console.log(`本地项目列表:`, file_name_list);
    // 本地云端项目列表
    let deleteLocalCloudProjectLs = _.compact(_.map(file_name_list, fileNameItem => {
        if (fse.readJsonSync(`${config.projectsPath}/${fileNameItem}/${fileNameItem}.json`).project_type == 'cloud') {
            return fileNameItem;
        }
    }))
    // 云端项目列表
    _.each(data, (data_item, idx) => {
        let downloadParams = {
            project: data_item,
            listener_name:
                "downstate" + data_item.projectName + ".zip",
            downloadPath: data_item.downloadUrl + '?access_token=' + localStorage.getItem("access_token").split(" ")[1],
            configPath: path.normalize(
                config.projectsPath + "/.." + "/projects_temp/"
            )
        }
        // 如本地已存在  则更新版本号是否更新
        if (_.indexOf(file_name_list, data_item.projectName) > -1) {
            let jsonPath = path.normalize(config.projectsPath + '/' + data_item.projectName + '/' + data_item.projectName + '.json')
            let projectJson = fse.readJsonSync(jsonPath)
            if (data_item.version > projectJson.updateAt.replace(/[: \r\n-]/g, "")) {
                needSynchronizeProjects.push(downloadParams)
            }
        } else {
            needSynchronizeProjects.push(downloadParams)
        }
        // 删除本地云端没权限项目
        if (_.indexOf(deleteLocalCloudProjectLs, data_item.projectName) > -1) {
            deleteLocalCloudProjectLs.splice(_.indexOf(deleteLocalCloudProjectLs, data_item.projectName), 1);
        }
    })
    console.log("需要更改类型的项目列表:", deleteLocalCloudProjectLs);
    _.each(deleteLocalCloudProjectLs, item => {
        store.commit("project/LOCAL_PROJECT_DELETE", { project_name: item });
        var readJson = fse.readJsonSync(
            `${config.projectsPath}/${item}/${item}.json`
        );
        readJson.project_type = "local";

        fse.writeFileSync(
            `${config.projectsPath}/${item}/${item}.json`,
            JSON.stringify(readJson, null, "\t"),
            "utf8"
        );

        let initialStatus = {
            project_name: readJson.project_name,
            project_type: readJson.project_type || "",
            json: readJson,
            date: moment(readJson.updateAt).format("YYYY-MM-DD")
        };
        store.commit("project/LOCAL_PROJECT", initialStatus);
    })

    // _.each(deleteLocalCloudProjectLs, item => {
    //     delDir(`${config.projectsPath}/${item}`);
    //     store.commit("project/LOCAL_PROJECT_DELETE", { project_name: item });
    // })
    console.log("需要同步的项目列表:", needSynchronizeProjects);
    if (needSynchronizeProjects.length > 0) {
        _.each(needSynchronizeProjects, (project, idx) => {
            let initialStatus = {
                project_name: project.project.projectName,
                project_type: 'cloud',
                downloadRate: 0,
                downloadStatus: "text",
                isDownloading: true
            }
            store.commit("project/PROJECT_DOWNLOAD", initialStatus);
        })
        store.commit("project/HAS_PROJECT_SYNCHRONIZE", true);
        downloadProject(needSynchronizeProjects, 0);
    }
}

// 删除文件夹
function delDir(path) {
    let files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) {
                delDir(curPath); //递归删除文件夹
            } else {
                fs.unlinkSync(curPath); //删除文件
            }
        });
        fs.rmdirSync(path);
    }
}

function downloadProject(projects, index) {
    if (index == projects.length) {
        store.commit("project/HAS_PROJECT_SYNCHRONIZE", false);
    } else {
        ipc.send('download', projects[index])
        ipc.on(projects[index].listener_name, function (event, result) {
            const projectDownloadStatus = {
                project_name: projects[index].project.projectName,
                project_type: 'cloud',
                downloadRate: result.progress,
                downloadStatus: 'text',
                isDownloading: true
            }
            store.commit("project/PROJECT_DOWNLOAD", projectDownloadStatus);
            console.log("PROJECT_DOWNLOAD")
            console.log(store.state.project.projectDownload)
            // store.dispatch("plugin/pluginDownload", downloadParams).then(plugin_cache => {
            if (result.state == 'interrupted' || result.state == 'cancelled') {
                ipc.removeAllListeners([projects[index].listener_name])
                console.log("$$$$$$")
                console.log(projects[index])
                console.log(result)
                const projectDownloadStatus = {
                    project_name: projects[index].project.projectName,
                    project_type: 'cloud',
                    downloadRate: (/^100$|^(\d|[1-9]\d)(\.\d+)*$/).test(result.progress) == true ? result.progress : 80,
                    downloadStatus: 'exception',
                    isDownloading: false,
                    errLog: `文件同步失败，取消${projects[index].project.projectName}同步`
                }
                Notification({
                    type: 'error',
                    message: projectDownloadStatus.errLog,
                    offset: 25
                })
                store.commit("project/PROJECT_DOWNLOAD", projectDownloadStatus);
                store.commit("project/PROJECT_DOWNLOADDELETE", projectDownloadStatus);
                if (fs.existsSync(result.filePath)) {
                    fs.unlinkSync(result.filePath)
                }
                index++
                downloadProject(projects, index);
            }
            if (result.state == 'completed') {
                ipc.removeAllListeners([projects[index].listener_name])
                console.log("@@@@@@")
                console.log(projects[index])
                console.log(result)
                decompress(result.filePath, config.projectsPath, {
                    filter: function (file) {
                        var r = true;
                        if (file.path.startsWith("__MACOSX")) {
                            r = false;
                        }
                        return r;
                    }
                }).then(files => {
                    console.log("decompress success")
                    fs.unlinkSync(result.filePath)

                    const projectDownloadStatus = {
                        project_name: projects[index].project.projectName,
                        project_type: 'cloud',
                        downloadRate: 90,
                        downloadStatus: 'text',
                        isDownloading: true,
                    }
                    let json = fse.readJsonSync(
                        `${config.projectsPath}/${projects[index].project.projectName}/${projects[index].project.projectName}.json`
                    )
                    const project_info = {
                        project_name: projects[index].project.projectName,
                        project_type: 'cloud',
                        json: json,
                        date: moment(json.updateAt).format('YYYY-MM-DD')
                    }
                    store.commit("project/PROJECT_DOWNLOAD", projectDownloadStatus);
                    getDownloadParams(files, projects[index].project.projectName).then(downresult => {
                        const projectDownloadStatus = {
                            project_name: projects[index].project.projectName,
                            project_type: 'cloud',
                            downloadRate: 100,
                            downloadStatus: 'success',
                            isDownloading: false,
                        }
                        store.commit("project/PROJECT_DOWNLOAD", projectDownloadStatus);
                        store.commit("project/PROJECT_DOWNLOADDELETE", projectDownloadStatus);
                        store.commit("project/LOCAL_PROJECT", project_info);
                        index++
                        downloadProject(projects, index)
                    }).catch(downderr => {
                        Notification({
                            type: 'error',
                            message: downderr,
                            duration: 0,
                            dangerouslyUseHTMLString: true,
                            offset: 25
                        })
                        const projectDownloadStatus = {
                            project_name: projects[index].project.projectName,
                            project_type: 'cloud',
                            downloadRate: 100,
                            downloadStatus: 'exception',
                            isDownloading: false,
                            errLog: downderr
                        }
                        store.commit("project/PROJECT_DOWNLOAD", projectDownloadStatus);
                        store.commit("project/PROJECT_DOWNLOADDELETE", projectDownloadStatus);
                        store.commit("project/LOCAL_PROJECT", project_info);
                        index++
                        downloadProject(projects, index)
                    })
                }).catch(err => {
                    console.log("decompress err")
                    console.log(err)
                    Notification({
                        type: '文件解压出错',
                        message: downderr,
                        duration: 0,
                        dangerouslyUseHTMLString: true,
                        offset: 25
                    })
                    const projectDownloadStatus = {
                        project_name: projects[index].project.projectName,
                        project_type: 'cloud',
                        downloadRate: 90,
                        downloadStatus: 'exception',
                        isDownloading: false,
                        errLog: "文件解压出错"
                    }
                    store.commit("project/PROJECT_DOWNLOAD", projectDownloadStatus);
                    store.commit("project/PROJECT_DOWNLOADDELETE", projectDownloadStatus);
                    if (fs.existsSync(path.normalize(config.projectsPath + '/' + projects[index].project.projectName))) {
                        fse.emptyDirSync(path.normalize(config.projectsPath + '/' + projects[index].project.projectName));
                        fs.rmdirSync(path.normalize(config.projectsPath + '/' + projects[index].project.projectName));
                    }
                    fs.unlinkSync(result.filePath)
                    index++
                    downloadProject(projects, index)
                })
            }
            // })
        })
    }
}

export function getDownloadParams(files, projectName) {
    return new Promise((resolve, reject) => {
        pluginViews({}).then(result => {
            // 线上插件库
            let onlinePlugins = result.data;
            console.log('线上插件库', onlinePlugins);
            // 需要下载的插件及版本
            let needDownPlugins = [];
            // 项目用到的插件及版本
            let projectPlugins = [];
            // 本地拥有的插件及版本
            let localPlugins = [];
            _.each(_.difference(fs.readdirSync(config.pluginsPath), ['list.json', 'npm_i.sh', '.DS_Store']), item => {
                let versions = _.difference(fs.readdirSync(`${config.pluginsPath}/${item}`), ['.DS_Store']);
                localPlugins = _.concat(localPlugins, _.map(versions, versionItem => {
                    return { plugin_id: item, version: versionItem }
                }))
            })
            console.log("本地拥有的插件及版本", localPlugins);
            _.each(files, file => {
                if (file.path.includes(projectName + ".json")) {
                    let readJson = fse.readJsonSync(config.projectsPath + "/" + file.path);
                    _.each(readJson.nodes, item => {
                        if (!_.find(projectPlugins, { plugin_id: item.plugin_id, version: item.version })) {
                            projectPlugins.push({ plugin_id: item.plugin_id, version: item.version })
                        }
                    })
                }
            })
            console.log("项目用到的插件及版本", projectPlugins);

            let downPlugins = _.differenceWith(projectPlugins, localPlugins, _.isEqual);
            // (本地插件版本 + 线上插件版本) 都不存在
            let abnormalPlugins = _.differenceWith(downPlugins, _.map(onlinePlugins, item => {
                return { plugin_id: item.plugin_id, version: item.version }
            }), _.isEqual);
            console.warn('本地插件版本 + 线上插件版本都不存在', abnormalPlugins);

            if (abnormalPlugins.length) {
                let target = _.map(abnormalPlugins, item => {
                    return `${item.plugin_id} - ${item.version}`
                })
                reject(`检测到<br />${target.length > 5 ? `${_.chunk(target, 5)[0].join('<br />')} 等${target.length - 5}个...` : target.join('<br />')} <br />以上插件版本本地且云端不存在`)
            } else {
                _.each(onlinePlugins, onlinePluginItem => {
                    _.each(downPlugins, downPluginItem => {
                        if (onlinePluginItem.plugin_id == downPluginItem.plugin_id && onlinePluginItem.version == downPluginItem.version) {
                            needDownPlugins.push(onlinePluginItem);
                        }
                    });
                });
                console.log('需要下载的插件及版本', needDownPlugins)

                _.each(needDownPlugins, (item, idx) => {
                    const downloadParams = {
                        plugin_id: item.plugin_id,
                        downloadRate: 0,
                        downloadStatus: "text",
                        isDownloading: true
                    };
                    store.commit("plugin/PLUGIN_DOWNLOAD", downloadParams);
                    const thePluginStatus = {
                        plugin_id: item.plugin_id,
                        needUpdate: true,
                        buttonText: "等待下载"
                    };

                    store.commit("plugin/PLUGIN_STATUS", thePluginStatus);
                });
                download(needDownPlugins, 0)
                    .then(result => {
                        console.warn("download resolve end");
                        resolve('下载插件成功');
                    })
                    .catch(error => {
                        console.warn("download reject end");
                        reject(error);
                    });
            }
        });
    })
}
function download(webPlugin, index, downloaded = [], notDownloaded = [], errPlugins = []) {
    return new Promise((resolve, reject) => {
        if (
            index === webPlugin.length &&
            downloaded.length === webPlugin.length
        ) {
            if (errPlugins.length) {
                reject(`${_.map(errPlugins, 'plugin_id')} <br>插件安装失败，请手动安装`);
            } else {
                resolve("DownloadEND");
            }
        } else if (
            index === webPlugin.length &&
            downloaded.length < webPlugin.length
        ) {
            console.warn("Download  notDownloaded");
            if (store.state.plugin.has_python_downloading) {
                return download(webPlugin, index, downloaded, notDownloaded, errPlugins).then(res => { resolve(res) }).catch(err => {
                    reject(err);
                });
            } else {
                store.commit("plugin/MARK_PYTHON_DOWNLOADING", true);
                return executeDownload(notDownloaded[0])
                    .then(result => {
                        downloaded.push(notDownloaded[0]);
                        _.remove(notDownloaded, function (item) {
                            return item == notDownloaded[0];
                        });
                        return download(webPlugin, index, downloaded, notDownloaded, errPlugins).then(res => { resolve(res) }).catch(err => {
                            reject(err);
                        });
                    })
                    .catch(err => {
                        downloaded.push(notDownloaded[0]);
                        errPlugins.push(notDownloaded[0]);
                        _.remove(notDownloaded, function (item) {
                            return item == notDownloaded[0];
                        });
                        return download(webPlugin, index, downloaded, notDownloaded, errPlugins).then(res => { resolve(res) }).catch(err => {
                            reject(err);
                        });
                    });
            }
        } else {
            let webPlugin_param = webPlugin[index];
            if (webPlugin_param.language === "python") {
                if (store.state.plugin.has_python_downloading) {
                    notDownloaded.push(webPlugin_param);
                    index++;
                    return download(webPlugin, index, downloaded, notDownloaded, errPlugins).then(res => { resolve(res) }).catch(err => {
                        reject(err);
                    });
                } else {
                    store.commit("plugin/MARK_PYTHON_DOWNLOADING", true);
                    return executeDownload(webPlugin_param)
                        .then(result => {
                            downloaded.push(webPlugin_param);
                            index++;
                            return download(webPlugin, index, downloaded, notDownloaded, errPlugins).then(res => { resolve(res) }).catch(err => {
                                reject(err);
                            });
                        })
                        .catch(err => {
                            downloaded.push(webPlugin_param);
                            errPlugins.push(webPlugin_param);
                            index++;
                            return download(webPlugin, index, downloaded, notDownloaded, errPlugins).then(res => { resolve(res) }).catch(err => {
                                reject(err);
                            });
                        });
                }
            } else {
                return executeDownload(webPlugin_param)
                    .then(result => {
                        downloaded.push(webPlugin_param);
                        index++;
                        return download(webPlugin, index, downloaded, notDownloaded, errPlugins).then(res => { resolve(res) }).catch(err => {
                            reject(err);
                        });
                    })
                    .catch(err => {
                        downloaded.push(webPlugin_param);
                        errPlugins.push(webPlugin_param);
                        index++;
                        return download(webPlugin, index, downloaded, notDownloaded, errPlugins).then(res => { resolve(res) }).catch(err => {
                            reject(err);
                        });
                    });
            }
        }
    })
}
function executeDownload(plugin) {
    return new Promise((resolve, reject) => {
        const downloadParams = {
            plugin_id: plugin.plugin_id,
            downloadRate: 0,
            downloadStatus: "text",
            isDownloading: true
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
                        pluginDownload({
                            plugin: plugin,
                            listener_name: `downstate${plugin.plugin_id}@${plugin.version}`,
                            downloadPath: `${environment.serverUrl}/downloads/plugins/${plugin.plugin_id}/${plugin.plugin_id}@${plugin.version}`,
                            configPath: path.normalize(`${config.pluginsPath}/../plugins_temp/`)
                        })
                            .then(result => {
                                console.warn(result);
                                store.dispatch("plugin/pluginDownloadDelete", plugin.plugin_id).then(pluginDownloadDelete => {
                                    console.warn(`${plugin.plugin_id}已安装最新版本`);
                                    const thePluginStatus = {
                                        plugin_id: plugin.plugin_id,
                                        needUpdate: false,
                                        buttonText: "已安装最新版本"
                                    };
                                    store.dispatch("plugin/pluginStatus", thePluginStatus).then(pluginStatus => {
                                        resolve(result);
                                    });
                                    if (plugin.language === "python") {
                                        store.dispatch("plugin/markPythonDownloading", false);
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
                                    store.dispatch(
                                        "plugin/markPythonDownloading",
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
                console.warn(err);
                const thePluginStatus = {
                    plugin_id: plugin.plugin_id,
                    needUpdate: true,
                    buttonText: "重新下载"
                };
                if (plugin.language === "python") {
                    store.dispatch("plugin/markPythonDownloading", false);
                }
                store
                    .dispatch("plugin/pluginStatus", thePluginStatus)
                    .then(the_result => {
                        reject(err);
                    });
            });
    });
}
