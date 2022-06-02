const { CronJob } = require('cron');
const fs = window.nodeRequire('fs');
const _ = require('lodash');
const crypto = require('crypto');
const path = window.nodeRequire('path');
const os = window.nodeRequire("os");
const axios = window.nodeRequire("axios");
const config = fse.readJsonSync(`${os.homedir()}/.uiauto/uiauto.conf`);
const ipc = window.nodeRequire('electron').ipcRenderer;
const { app } = require('electron');
// const { execute } = window.nodeRequire(path.normalize(path.resolve() + "/public/runner/index.js"));


// 重启执行器
if (os.platform() == 'darwin' && path.resolve() == "/") {
    delete window.nodeRequire.cache[
        path.normalize(app.getPath("exe") + '../../../public/base_integration/uiauto_executor/executor.js')
    ];
} else {
    delete window.nodeRequire.cache[
        path.normalize(
            path.resolve() + "/public/base_integration/uiauto_executor/executor.js"
        )
    ];
}

const runner = window.executor;

var runningJobCron = [];

exports.cronFn = function () {
    const parentPath = config.projectsPath;
    const log = console.log.bind(console);
    /**
     * @description:                    每十秒钟判断cron规则有无改变
     * @param {type} 
     * @return: 
     */
    const jobCron = new CronJob({
        cronTime: '*/10 * * * * *',
        onTick: function () {
            // 检测是否有新增的定时任务
            try {
                refreshIntervalCron().then(function (result) {
                    // jobCron.start();
                }).catch(function (err) {
                    console.log('===========检测规则出错==========');
                    console.log(err);
                    // jobCron.start();
                });
            } catch (error) {
                console.log('===========jobCron error==========');
                console.log(error);
            }
        },
        onComplete: function () {
            console.log('=====onComplete=====');
            if (jobCron) {
                jobCron.start();
            }
        },
        start: true,
        timeZone: 'Asia/Shanghai'
    });

    var refreshIntervalCron = function () {
        return new Promise((resolve, reject) => {
            try {

                // 统计执行规则方法
                let cronSettings = getCronSetting();
                // log(cronSettings);
                _.each(cronSettings, cronSetting => {
                    var hashObject = _.pick(cronSetting, ['project_name', 'cron']);
                    var en_text = _.join(_.values(hashObject), ',');
                    var hashId = crypto.createHash('md5').update(en_text).digest('hex');
                    cronSetting.hashId = hashId;
                })

                // 正在运行的id
                var runningHashIds = _.map(runningJobCron, 'hashId');
                var allJobHashIds = _.map(cronSettings, 'hashId');
                var newHashIds = _.difference(allJobHashIds, runningHashIds);
                var removeHashIds = _.difference(runningHashIds, allJobHashIds);

                // 移除已经作废的任务
                _.each(removeHashIds, function (hashId, index) {
                    var removeIndex = _.findIndex(runningJobCron, {
                        hashId: hashId
                    });
                    console.log('-----移除已经作废的任务----')
                    console.log(removeIndex)
                    runningJobCron[removeIndex].cron.stop();
                    _.pullAt(runningJobCron, removeIndex);
                });

                // 新增任务
                _.each(newHashIds, function (hashId, index) {
                    var newJob = _.find(cronSettings, {
                        hashId: hashId
                    });
                    var newCron = new CronJob({
                        cronTime: newJob.cron,
                        onTick: function () {
                            console.error(`${newJob.project_name} is running`);
                            // ipc.send('window_minimize', null)
                            if (runner.hasOwnProperty("restart")) {
                                runner.restart();
                            }
                            axios.post(config.serverUrl + "/api/v1/tasks/synchronize/upload", {
                                uploadData: [
                                    {
                                        project_code: newJob.project_name,
                                        project_name: newJob.project_name,
                                        status: "todo",
                                        deviceId: JSON.parse(
                                            fs.readFileSync(`${os.homedir()}/.uiauto/uiauto.conf`, "utf8")
                                        ).deviceId,
                                        message: '等待执行'
                                    }
                                ]
                            }, {
                                headers: {
                                    "Authorization": localStorage.getItem('access_token')
                                }
                            }).then(uploadTaskRes => {
                                // runner.execute(newJob.project_name, { uiauto_task_id: uploadTaskRes.data.data[0].id }).then((res) => {
                                //     console.log('-=-=-execute res-=-=-=-=')
                                //     ipc.send('window_maximize', null);
                                //     axios.post(config.serverUrl + "/api/v1/tasks/edit", {
                                //         id: uploadTaskRes.data.data[0].id,
                                //         value: {
                                //             status: "success",
                                //             message: JSON.stringify(res)
                                //         }
                                //     }, {
                                //         headers: {
                                //             "Authorization": localStorage.getItem('access_token')
                                //         }
                                //     })
                                // }).catch((err) => {
                                //     console.error('-=-=-execute err-=-=-=-=')
                                //     console.error(err);
                                //     ipc.send('window_maximize', null);
                                //     axios.post(config.serverUrl + "/api/v1/tasks/edit", {
                                //         id: uploadTaskRes.data.data[0].id,
                                //         value: {
                                //             status: "fail",
                                //             message: JSON.stringify(res)
                                //         }
                                //     }, {
                                //         headers: {
                                //             "Authorization": localStorage.getItem('access_token')
                                //         }
                                //     })
                                // });
                            })

                        },
                        start: true,
                        timeZone: 'Asia/Shanghai'
                    });
                    runningJobCron.push({
                        project_name: newJob.project_name,
                        hashId: hashId,
                        cron: newCron
                    });
                });

            } catch (err) {
                reject(err)
            }
        })
    }


    /**
     * @description:                    遍历项目文件，获取所有项目的cron执行规则
     * @param {type} 
     * @return:                         Array<Object>
     */
    var getCronSetting = function () {
        let returnResults = [];
        // log(parentPath)
        // log(fs);
        let projectNames = _.difference(fs.readdirSync(parentPath), [".DS_Store"]);
        // log(projectNames);

        _.each(projectNames, projectName => {
            let projectRoot = `${parentPath}/${projectName}`;
            let stat = fs.lstatSync(projectRoot);
            if (!stat.isDirectory()) return;
            let projectFile = `${projectRoot}/${projectName}.json`;
            if (!fs.existsSync(projectFile)) return;

            try {
                let project = JSON.parse(fs.readFileSync(projectFile, 'utf8'));
                project.cron && returnResults.push({ project_name: project.project_name, cron: project.cron })
            } catch (error) {
                return;
            }
        })

        return returnResults;
    }
}
