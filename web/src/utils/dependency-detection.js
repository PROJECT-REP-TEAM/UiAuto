let fse = window.nodeRequire('fs-extra');
let fs = window.nodeRequire('fs');
let path = window.nodeRequire('path')
let async = require('async');
let decompress = window.nodeRequire('decompress');
let { executeDownload, download } = require("@/utils/electron.js");
import { pluginViews } from "@/api/plugin";
import config from '@/config/environment/index';
import _ from 'lodash';

let current_execution_list = [];
let global_execution_list = [];
let download_process = false;
let poolTimer = null;

export function currentExecutionList() {
    return current_execution_list;
}

export async function dependencyDetection(id, json, type) {
    if (type == 'again') {
        _.remove(current_execution_list, item => {
            return item.name == json.name && item.project_name == json.project_name
        })
    }
    if (!_.find(current_execution_list, {
        name: json.name,
        project_name: json.project_name
    })) {
        current_execution_list.push({
            name: json.name,
            project_name: json.project_name,
            result: "install",
            message: "正在安装插件"
        })
    }
    if (!_.find(global_execution_list, { id: id })) {
        global_execution_list.push({ id: id, json: json, type: type });
    }

    if (!poolTimer) {
        poolTimer = setInterval(async () => {
            if (!global_execution_list.length) {
                console.log('清除依赖检测任务池~')
                clearInterval(poolTimer);
                poolTimer = null;
            }

            if (!download_process && global_execution_list.length) {

                // 开启 进程锁
                download_process = true;

                // 删除全局第一个参数
                let global_execution_item = global_execution_list.shift();

                downloadFn(global_execution_item.json);
            }
        }, 1000)
    }
    return current_execution_list;

}

async function downloadFn(json) {
    // 当前项目所依赖的 插件-版本 集合
    let plugin_version_list = [];
    _.each(json.nodes, item => {
        if (!_.find(plugin_version_list, {
            plugin_id: item.plugin_id,
            version: item.version
        })) {
            plugin_version_list.push({
                plugin_id: item.plugin_id,
                version: item.version
            });
        }
    });

    // 整理需要下载安装的插件
    let need_download_plugin = [];
    let target_need_download_plugin = [];
    _.each(plugin_version_list, p_v_item => {
        if (!fs.existsSync(`${config.pluginsPath}/${p_v_item.plugin_id}`) || !fs.existsSync(`${config.pluginsPath}/${p_v_item.plugin_id}/${p_v_item.version}`)) {
            need_download_plugin.push(p_v_item);
        }
    })

    console.log('need_download_plugin', need_download_plugin)

    if (need_download_plugin.length) {
        // 整理插件下载信息
        let _pluginViews = (await pluginViews({
            needs: "all",
            PluginIds: _.map(need_download_plugin, "plugin_id").join(",")
        })).result;
        if (_pluginViews.length) {
            let message = "线上未找到 ";
            let error = false;
            _.each(need_download_plugin, item => {
                let temp = _.find(_pluginViews, {
                    pluginId: item.plugin_id,
                    version: item.version
                });
                if (temp) {
                    target_need_download_plugin.push(temp);
                } else {
                    error = true;
                    message += `${item.plugin_id}-${item.version} `;
                }
            })
            if (error) {
                let findPlugin = _.find(current_execution_list, {
                    name: json.name,
                    project_name: json.project_name
                });
                findPlugin.result = 'unpass';
                findPlugin.message = message;
            }

        } else {
            let findPlugin = _.find(current_execution_list, {
                name: json.name,
                project_name: json.project_name
            });
            findPlugin.result = 'unpass';
            findPlugin.message = `线上未找到 ${_.map(need_download_plugin, "plugin_id").join(",")}`;
        }

    } else {
        _.find(current_execution_list, {
            name: json.name,
            project_name: json.project_name
        }).result = 'pass';
    }

    console.log('target_need_download_plugin', target_need_download_plugin.length)
    if (target_need_download_plugin.length) {
        async.mapSeries(target_need_download_plugin, (item, cb) => {
            let newPluginObj = _.cloneDeep(item);
            newPluginObj.plugin_id = item.pluginId;
            newPluginObj.isUiautoBaseIntegration =
                item.isUiautoBaseIntegration === "true" ? true : false;
            executeDownload(newPluginObj).then(res => {
                cb(null, {
                    plugin_id: item.pluginId,
                    version: item.version
                });
            }).catch(err => {
                cb({
                    plugin_id: item.pluginId,
                    version: item.version
                }, null);
            })
        }, (err, res) => {
            download_process = false;
            let findPlugin = _.find(current_execution_list, {
                name: json.name,
                project_name: json.project_name
            });
            if (err) {
                typeof err == "object" && (err = [err]);
                let message = '';
                _.each(err, (item, idx) => {
                    message += ` ${item.plugin_id}-${item.version} `
                })
                findPlugin.result = 'unpass';
                findPlugin.message = `插件${message}安装失败`;
            }
            if (_.compact(res).length == need_download_plugin.length) {
                findPlugin.result = 'pass';
                findPlugin.message = "检测成功";
            }
        })
    } else {
        download_process = false;
    }
}

export function syncStore(storeList) {
    let needSyncStoreList = _.map(storeList, item => {
        return {
            project: item,
            listener_name: `downstate${item.scriptId}`,
            downloadUrl: `${config.serverUrl}/uiauto/script/download?scriptId=${item.scriptId}&token=${localStorage.getItem('uiauto_access_token')}`,
            downloadPath: `${path.normalize(`${config.projectsPath}/../projects_temp/`)}${item.projectName}.zip`,
            configPath: path.normalize(`${config.projectsPath}/../projects_temp/`),
            isInstallPlugin: false
        }
    });

    return new Promise((resolve, reject) => {
        async.mapSeries(needSyncStoreList, (item, cb) => {
            download(item).then(() => {
                decompress(item.downloadPath, config.storePath, {
                    filter: function (file) {
                        var r = true
                        if (file.path.startsWith('__MACOSX')) {
                            r = false
                        }
                        return r
                    }
                }).then(files => {
                    fs.unlinkSync(item.downloadPath)
                    cb(null, item);
                }).catch(err => {
                    if (fs.existsSync(path.normalize(config.storePath + '/' + item.project.projectName))) {
                        fse.emptyDirSync(path.normalize(config.storePath + '/' + item.project.projectName))
                        fs.rmdirSync(path.normalize(config.storePath + '/' + item.project.projectName))
                    }
                    fs.unlinkSync(item.downloadPath)
                    cb(null, item);
                })
            }).catch(() => {
                cb(null, null);
            })
        }, (err, res) => {
            resolve();
        })
    })
}
