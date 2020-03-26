const path = window.require('path');
const os = window.require('os');
const fs = window.require('fs');
const fse = window.require("fs-extra");
const async = window.require('async');
const uuidv4 = window.require('uuid/v4');
const _ = window.require('lodash');
const config = fse.readJsonSync(`${path.resolve()}/.uiauto/uiauto.conf`);
const pyutil = window.require(path.resolve() + '/public/utils/pyutil');
const moment = window.require('moment');
const sandbox = window.require('@fire-dream/sandbox');

let global_data_store = {}; // 全局变量存储
let global_plugin_require = {}; // require所有的本地插件
let local_plugins = {}; // 本地插件数组Ø
let project_profile = {};
let current_task_logs = [];

// 打印模式
let runner = {
    log: console.log.bind(console),
    error: console.error.bind(console),
    warn: console.warn.bind(console)

};


/**
 * TODO:
 * - 执行项目json文件
 * @param {string} project_name
 */
exports.execute = (project_name, options = {}) => {
    setLogMode(options);
    const promise = new Promise(async (resolve, reject) => {
        try {
            current_task_logs = [];
            global_data_store = {
                "uiauto_token": localStorage.getItem('access_token')
            };
            global_plugin_require = {};

            project_profile = JSON.parse(fs.readFileSync(path.normalize(`${config.projectsPath}/${project_name}/${project_name}.json`), 'utf8'));
            console.log('开始执行项目：' + project_profile.project_name);
            uiLog.log('开始执行项目：' + project_profile.project_name);

            if (typeof project_profile !== 'undefined' && project_profile !== null) {
                if (typeof project_profile.nodes !== 'undefined' && project_profile.nodes !== null && project_profile.nodes.length > 0) {
                    const start_node = find_first_node(project_profile.nodes);
                    const end_node = find_end_node(project_profile.nodes);

                    if (typeof start_node !== 'undefined' && start_node !== null) {
                        if (typeof end_node !== 'undefined' && end_node !== null) {
                            const tasks = create_tasks(start_node);
                            console.log('流程任务：', tasks);
                            async.auto(tasks, (err, results) => {
                                window.global_data_store = global_data_store;
                                console.log('流程执行结果：', err, results);
                                if (err) {
                                    // uiLog.success("执行出错");
                                    console.error(current_task_logs.join("\n"));
                                    reject(current_task_logs.join("\n"));
                                    return false;
                                }

                                const keys = _.keys(results);
                                let failed_node = null;
                                _.forEach(keys, (key) => {
                                    if (!failed_node && results[key].success === false) {
                                        failed_node = results[key];
                                    }
                                });

                                if (failed_node) {
                                    reject(current_task_logs.join("\n"));
                                } else {
                                    // uiLog.success("执行成功");
                                    resolve(current_task_logs.join("\n"));
                                }
                            });

                        } else {
                            throw new Error('当前项目没有结束结点');
                        }

                    } else {
                        throw new Error('当前项目没有起始节点');
                    }
                } else {
                    throw new Error('当前项目没有操作节点');
                }
            } else {
                throw new Error('当前项目为空白项目');
            }
        } catch (e) {
            reject(e);
        }
    });

    return promise;
};

/**
 * TODO:
 * - 创建主任务
 * @param {*} node
 */
const create_tasks = (node, temp_params, isSideRoad) => {

    runner.log('create_tasks>>>>>>>>>>>>', node);
    console.log('create_tasks>>>>>>>>>>>>', node);
    let tasks = {};

    try {
        const end_node = find_end_node(project_profile.nodes);
        const next_lines = find_next_lines(project_profile, node);
        const prev_lines = find_prev_lines(project_profile, node);
        const exception_lines = find_exception_lines(project_profile, node);
        let next_execute_node_ids = [];
        let next_exception_node_ids = [];

        switch (node.shapeType) {
            case 'Start': // 开始节点
                next_execute_node_ids = _.map(next_lines, 'target');

                tasks[node.id] = (callback) => {
                    uiLog.log("节点【" + node.label + "】：开始执行");
                    callback(null, {
                        success: true,
                        next_execute_nodes: next_execute_node_ids,
                        result: null
                    });
                    uiLog.log("节点【" + node.label + "】：执行成功");
                };
                break;
            case 'Condition': // 条件选择节点
                next_exception_node_ids = _.map(exception_lines, 'target');
                next_execute_node_ids = _.map(next_lines, 'target');
                tasks[node.id] = [];
                _.forEach(_.map(prev_lines, "source"), (line) => {
                    tasks[node.id].push(line);
                });
                tasks[node.id].push((results, callback) => {
                    let callback_result = {
                        success: true,
                        node_label: node.label,
                        next_execute_nodes: [],
                        result: null,
                        error: null
                    };

                    try {
                        next_execute_node_ids = _.difference(next_execute_node_ids, next_exception_node_ids);
                        let execute_nodes = get_next_execute_nodes(results);
                        if (execute_nodes.indexOf(node.id) > -1) {
                            uiLog.log("节点【" + node.label + "】：开始执行");

                            execute_conditional_node(node, temp_params)
                                .then(result => {
                                    console.log("execute_conditional_node>>>>>>>>>>>>>", result);
                                    let lines_target = _.compact(_.map(result, result_item => {

                                        if (!result_item.status) return;

                                        let target = _.find(next_lines, {
                                            label: result_item.name + ''
                                        });

                                        if (target) {
                                            return target.target
                                        }
                                    }));
                                    console.log("execute_conditional_node>>>>>>>>>>>>>lines_target", lines_target);
                                    callback_result.success = true;
                                    callback_result.next_execute_nodes = lines_target;
                                    callback_result.result = result;
                                    callback(null, callback_result);
                                    uiLog.success("节点【" + node.label + "】：执行成功");
                                })
                                .catch(err => {
                                    uiLog.error("节点【" + node.label + "】：执行出错，错误信息：" + handleCatchError(err));
                                    callback_result.success = false;
                                    callback_result.error = err;
                                    if (!!next_exception_node_ids && next_exception_node_ids.length > 0) {
                                        uiLog.log("节点【" + node.label + "】：开始处理异常");
                                        execute_exception_node(next_exception_node_ids, project_profile)
                                            .then((result) => {
                                                callback_result.next_execute_nodes = next_execute_node_ids;
                                                callback(null, callback_result);
                                                uiLog.log("节点【" + node.label + "】：异常处理完成，流程继续执行");
                                            })
                                            .catch((err) => {
                                                callback_result.next_execute_nodes = [];
                                                callback(null, callback_result);
                                                uiLog.log("节点【" + node.label + "】：异常处理完成，流程停止执行");
                                            });

                                    } else {
                                        callback_result.next_execute_nodes = [];
                                        callback(null, callback_result);
                                    }
                                });
                        } else {
                            callback_result.success = true;
                            callback_result.next_execute_nodes = [];
                            callback(null, callback_result);
                        }
                    } catch (e) {
                        uiLog.error("节点【" + node.label + "】：执行出错，错误信息：" + handleCatchError(e));
                        callback_result.success = false;
                        callback_result.error = e;

                        if (!!next_exception_node_ids && next_exception_node_ids.length > 0) {
                            uiLog.log("节点【" + node.label + "】：开始处理异常");
                            execute_exception_node(next_exception_node_ids, project_profile)
                                .then((result) => {
                                    callback_result.next_execute_nodes = next_execute_node_ids;
                                    callback(null, callback_result);
                                    uiLog.log("节点【" + node.label + "】：异常处理完成，流程继续执行");
                                })
                                .catch((err) => {
                                    callback_result.next_execute_nodes = [];
                                    callback(null, callback_result);
                                    uiLog.log("节点【" + node.label + "】：异常处理完成，流程停止执行");
                                });

                        } else {
                            callback_result.next_execute_nodes = [];
                            callback(null, callback_result);
                        }
                    }
                });
                break;
            case 'Circulation':
                // 循环节点
                // 获取纵向的线路
                let lines = _.filter(next_lines, (line) => {
                    const MAIN_ROAD_ANCHORS = [0, 2];
                    return MAIN_ROAD_ANCHORS.includes(line.sourceAnchor);
                });
                next_exception_node_ids = _.map(exception_lines, 'target');
                next_execute_node_ids = _.map(lines, 'target');
                tasks[node.id] = [];
                _.forEach(_.map(prev_lines, "source"), (line) => {
                    tasks[node.id].push(line);
                });
                tasks[node.id].push((results, callback) => {
                    let callback_result = {
                        success: true,
                        node_label: node.label,
                        next_execute_nodes: [],
                        result: null,
                        error: null
                    };

                    try {
                        next_execute_node_ids = _.difference(next_execute_node_ids, next_exception_node_ids);
                        let execute_nodes = get_next_execute_nodes(results);

                        if (execute_nodes.indexOf(node.id) > -1) {
                            uiLog.log("节点【" + node.label + "】：开始执行");

                            execute_circulation_node(node, temp_params, isSideRoad)
                                .then(result => {
                                    callback_result.success = true;
                                    callback_result.next_execute_nodes = next_execute_node_ids;
                                    callback_result.result = result;
                                    callback(null, callback_result);
                                    uiLog.success("节点【" + node.label + "】：执行完成");
                                })
                                .catch(err => {
                                    uiLog.error("节点【" + node.label + "】：执行出错，错误信息：" + handleCatchError(err));
                                    callback_result.success = false;
                                    callback_result.error = err;
                                    if (!!next_exception_node_ids && next_exception_node_ids.length > 0) {
                                        uiLog.log("节点【" + node.label + "】：开始处理异常");
                                        execute_exception_node(next_exception_node_ids, project_profile)
                                            .then((result) => {
                                                callback_result.next_execute_nodes = next_execute_node_ids;
                                                callback(null, callback_result);
                                                uiLog.log("节点【" + node.label + "】：异常处理完成，流程继续执行");
                                            })
                                            .catch((err) => {
                                                callback_result.next_execute_nodes = [];
                                                callback(null, callback_result);
                                                uiLog.log("节点【" + node.label + "】：异常处理完成，流程停止执行");
                                            });

                                    } else {
                                        callback_result.next_execute_nodes = [];
                                        callback(null, callback_result);
                                    }
                                });
                        } else {
                            callback_result.success = true;
                            callback_result.next_execute_nodes = [];
                            callback(null, callback_result);
                        }
                    } catch (e) {
                        uiLog.log("节点【" + node.label + "】：执行出错，错误信息：" + handleCatchError(e));
                        callback_result.success = false;
                        callback_result.error = e;
                        if (!!next_exception_node_ids && next_exception_node_ids.length > 0) {
                            uiLog.log("节点【" + node.label + "】：开始处理异常");
                            execute_exception_node(next_exception_node_ids, project_profile)
                                .then((result) => {
                                    callback_result.next_execute_nodes = next_execute_node_ids;
                                    callback(null, callback_result);
                                    uiLog.log("节点【" + node.label + "】：异常处理完成，流程继续执行");
                                })
                                .catch((err) => {
                                    callback_result.next_execute_nodes = [];
                                    callback(null, callback_result);
                                    uiLog.log("节点【" + node.label + "】：异常处理完成，流程停止执行");
                                });

                        } else {
                            callback_result.next_execute_nodes = [];
                            callback(null, callback_result);
                        }
                    }
                });
                break;
            case 'Convention': // 常规节点
                next_execute_node_ids = _.map(next_lines, 'target');
                next_exception_node_ids = _.map(exception_lines, 'target');
                tasks[node.id] = [];
                _.forEach(_.map(prev_lines, "source"), (line) => {
                    tasks[node.id].push(line);
                });
                console.log("next_exception_node_ids>>>>>>>>.", next_exception_node_ids);

                tasks[node.id].push((results, callback) => {
                    console.log("Convention start execute", moment().format("YYYY-MM-DD HH:mm:ss SSS"));
                    let callback_result = {
                        success: true,
                        node_label: node.label,
                        next_execute_nodes: [],
                        result: null,
                        error: null
                    };

                    try {
                        next_execute_node_ids = _.difference(next_execute_node_ids, next_exception_node_ids);
                        let execute_nodes = get_next_execute_nodes(results);
                        if (execute_nodes.indexOf(node.id) > -1) {
                            uiLog.log("节点【" + node.label + "】：开始执行");
                            execute_convention_node(node, temp_params, isSideRoad)
                                .then(result => {
                                    console.log("Convention finish execute", moment().format("YYYY-MM-DD HH:mm:ss SSS"));
                                    callback_result.success = true;
                                    callback_result.next_execute_nodes = next_execute_node_ids;
                                    callback_result.result = result;
                                    callback(null, callback_result);
                                    uiLog.log("节点【" + node.label + "】：执行完成");
                                })
                                .catch(err => {
                                    uiLog.error("节点【" + node.label + "】：执行出错，错误信息：" + handleCatchError(err));
                                    callback_result.success = false;
                                    callback_result.error = err;
                                    if (!!next_exception_node_ids && next_exception_node_ids.length > 0) {
                                        uiLog.log("节点【" + node.label + "】：开始处理异常");
                                        execute_exception_node(next_exception_node_ids, project_profile)
                                            .then((result) => {
                                                callback_result.next_execute_nodes = next_execute_node_ids;
                                                callback(null, callback_result);
                                                uiLog.log("节点【" + node.label + "】：异常处理完成，流程继续执行");
                                            })
                                            .catch((err) => {
                                                callback_result.next_execute_nodes = [];
                                                callback(null, callback_result);
                                                uiLog.log("节点【" + node.label + "】：异常处理完成，流程停止执行");
                                            });

                                    } else {
                                        callback_result.next_execute_nodes = [];
                                        callback(null, callback_result);
                                    }
                                });

                        } else {
                            callback_result.success = true;
                            callback_result.next_execute_nodes = [];
                            callback(null, callback_result);
                        }
                    } catch (e) {
                        uiLog.error("节点【" + node.label + "】：执行出错，错误信息：" + handleCatchError(e));
                        callback_result.success = false;
                        callback_result.error = e;
                        if (!!next_exception_node_ids && next_exception_node_ids.length > 0) {
                            uiLog.log("节点【" + node.label + "】：开始处理异常");
                            execute_exception_node(next_exception_node_ids, project_profile)
                                .then((result) => {
                                    callback_result.next_execute_nodes = next_execute_node_ids;
                                    callback(null, callback_result);
                                    uiLog.log("节点【" + node.label + "】：异常处理完成，流程继续执行");
                                })
                                .catch((err) => {
                                    callback_result.next_execute_nodes = [];
                                    callback(null, callback_result);
                                    uiLog.log("节点【" + node.label + "】：异常处理完成，流程停止执行");
                                });

                        } else {
                            callback_result.next_execute_nodes = [];
                            callback(null, callback_result);
                        }
                    }
                });

                break;
            case 'Script': // 脚本节点
                console.log('create-----------Script');
                next_exception_node_ids = _.map(exception_lines, 'target');
                next_execute_node_ids = _.map(next_lines, 'target');

                tasks[node.id] = [];
                _.forEach(_.map(prev_lines, "source"), (line) => {
                    tasks[node.id].push(line);
                });

                tasks[node.id].push((results, callback) => {
                    console.log("Script>>>>>>>>>>>", results);
                    let callback_result = {
                        success: true,
                        node_label: node.label,
                        next_execute_nodes: [],
                        result: null,
                        error: null
                    };

                    try {
                        next_execute_node_ids = _.difference(next_execute_node_ids, next_exception_node_ids);
                        let execute_nodes = get_next_execute_nodes(results);
                        if (execute_nodes.indexOf(node.id) > -1) {
                            uiLog.log("节点【" + node.label + "】：开始执行");
                            execute_script_node(node, temp_params, isSideRoad)
                                .then(result => {
                                    callback_result.success = true;
                                    callback_result.next_execute_nodes = next_execute_node_ids;
                                    callback_result.result = result;
                                    callback(null, callback_result);
                                    uiLog.log("节点【" + node.label + "】：执行完成");
                                })
                                .catch(err => {
                                    uiLog.error("节点【" + node.label + "】：执行出错，错误信息：" + handleCatchError(err));
                                    callback_result.success = false;
                                    callback_result.error = err;
                                    if (!!next_exception_node_ids && next_exception_node_ids.length > 0) {
                                        uiLog.log("节点【" + node.label + "】：开始处理异常");
                                        execute_exception_node(next_exception_node_ids, project_profile)
                                            .then((result) => {
                                                callback_result.next_execute_nodes = next_execute_node_ids;
                                                callback(null, callback_result);
                                                uiLog.log("节点【" + node.label + "】：异常处理完成，流程继续执行");
                                            })
                                            .catch((err) => {
                                                callback_result.next_execute_nodes = [];
                                                callback(null, callback_result);
                                                uiLog.log("节点【" + node.label + "】：异常处理完成，流程停止执行");
                                            });

                                    } else {
                                        callback_result.next_execute_nodes = [];
                                        callback(null, callback_result);
                                    }
                                });

                        } else {
                            callback_result.success = true;
                            callback_result.next_execute_nodes = [];
                            callback(null, callback_result);
                        }
                    } catch (e) {
                        uiLog.error("节点【" + node.label + "】：执行出错，错误信息：" + handleCatchError(e));
                        console.log(e);
                        callback_result.success = false;
                        callback_result.error = e;
                        if (!!next_exception_node_ids && next_exception_node_ids.length > 0) {
                            uiLog.log("节点【" + node.label + "】：开始处理异常");
                            execute_exception_node(next_exception_node_ids, project_profile)
                                .then((result) => {
                                    callback_result.next_execute_nodes = next_execute_node_ids;
                                    callback(null, callback_result);
                                    uiLog.log("节点【" + node.label + "】：异常处理完成，流程继续执行");
                                })
                                .catch((err) => {
                                    callback_result.next_execute_nodes = [];
                                    callback(null, callback_result);
                                    uiLog.log("节点【" + node.label + "】：异常处理完成，流程停止执行");
                                });
                        } else {
                            callback_result.next_execute_nodes = [];
                            callback(null, callback_result);
                        }
                    }
                });
                break;
            case 'End': // 结束节点
                next_exception_node_ids = _.map(exception_lines, 'target');
                next_execute_node_ids = _.map(next_lines, 'target');
                tasks[node.id] = [];
                _.forEach(_.map(prev_lines, "source"), (line) => {
                    tasks[node.id].push(line);
                });
                tasks[node.id].push((results, callback) => {
                    console.log("end>>>>>>>>>>>>>>>>", global_data_store);
                    uiLog.log("节点【" + node.label + "】：开始执行");
                    uiLog.log("节点【" + node.label + "】：执行完成");
                    next_execute_node_ids = _.difference(next_execute_node_ids, next_exception_node_ids);
                    let callback_result = {
                        success: true,
                        node_label: node.label,
                        next_execute_nodes: [],
                        result: null,
                        error: null
                    };
                    const prev_node_ids = _.keys(results);
                    let failed_node = null;
                    if (!!prev_node_ids && prev_node_ids.length > 0) {

                        _.forEach(prev_node_ids, (id) => {
                            if (results[id].success === false) {
                                failed_node = results[id];
                            }
                        });

                        if (!!failed_node) {
                            uiLog.error("流程执行结果：执行失败，出错节点【" + failed_node.node_label + "】，错误信息：" + handleCatchError(failed_node.error));
                            if (!!next_exception_node_ids && next_exception_node_ids.length > 0) {
                                console.log("end>>>>>>>exist error node");
                                uiLog.log("开始处理流程全局异常");
                                execute_exception_node(next_exception_node_ids, project_profile)
                                    .then((result) => {
                                        callback_result.next_execute_nodes = next_execute_node_ids;
                                        callback(null, callback_result);
                                        uiLog.log("流程全局异常处理完成");
                                    })
                                    .catch((err) => {
                                        callback_result.next_execute_nodes = [];
                                        callback(null, callback_result);
                                        uiLog.log("流程全局异常处理完成");
                                    });
                            } else {
                                callback(failed_node.error, callback_result);
                            }
                        } else {
                            callback_result.next_execute_nodes = next_execute_node_ids;
                            callback(null, callback_result);
                            uiLog.success("流程执行结果：执行成功");
                        }
                    } else {
                        callback_result.next_execute_nodes = next_execute_node_ids;
                        callback(null, callback_result);
                        uiLog.success("流程执行结果：执行失败");
                    }
                });
                break;
        }

        runner.log('create_tasks>>>>>>', next_execute_node_ids);
        if (node.shapeType !== "Abnormal") {
            if (next_execute_node_ids && next_execute_node_ids.length > 0) {
                runner.log(project_profile.nodes);

                _.forEach(next_execute_node_ids, (node_id) => {
                    const next_node = _.find(project_profile.nodes, {
                        id: node_id
                    });
                    if (next_node) {
                        tasks = _.assignIn(tasks, create_tasks(next_node, temp_params, isSideRoad));
                    }
                });
            }
        }
    } catch (e) {
        throw handleCatchError(e);
    }

    return tasks;

};

/**
 * TODO:
 * - 获取下级节点
 * @param {*} results
 */
const get_next_execute_nodes = (results) => {
    const keys = _.keys(results);
    let execute_nodes = [];
    _.forEach(keys, (key) => {
        execute_nodes = _.concat(execute_nodes, results[key].next_execute_nodes);
    });

    return execute_nodes;
};

/**
 * TODO:
 * - 执行异常节点
 * @param exception_node_ids
 */
const execute_exception_node = (exception_node_ids, project_profile) => {
    const promise = new Promise((resolve, reject) => {
        const series_tasks = [];
        _.forEach(exception_node_ids, (id) => {
            series_tasks.push((callback) => {
                const temp_node = _.find(project_profile.nodes, {id: id});
                const next_lines = find_next_lines(project_profile, temp_node);
                let tasks = {};
                const next_execute_node_ids = _.map(next_lines, 'target');
                tasks[id] = (task_callback) => {
                    let callback_result = {
                        success: true,
                        node_label: temp_node.label,
                        next_execute_nodes: next_execute_node_ids,
                        result: null,
                        error: null
                    };
                    task_callback(null, callback_result)
                };

                _.forEach(next_lines, (line) => {
                    const next_node = _.find(project_profile.nodes, {
                        id: line.target
                    });
                    if (next_node) {
                        tasks = _.assignIn(tasks, create_tasks(next_node));
                    }
                });
                async.auto(tasks, (err, results) => {
                    const params = generate_input_params(temp_node);
                    if (!params.kill_task) {
                        callback(null, results);
                    } else {
                        if (err) {
                            callback(err);
                            return false;
                        }

                        callback(new Error('强制终止流程'), results);
                    }
                });
            });

        });

        console.log("执行器 - 异常处理任务：", series_tasks);
        async.series(series_tasks, (err, results) => {
            console.log('执行器 - 异常处理任务执行结果：', err, results);
            if (err) {
                reject(err);
                return false;
            }

            resolve(results);
        });
    });

    return promise;
};

/**
 * TODO:
 * - 执行开始节点
 * @param {object} node
 */
const execute_start_node = (node) => {
    const promise = new Promise(async (resolve, reject) => {
        try {
            const general_property = get_general_property(node);
            const plugin = find_plugin_for_node(local_plugins, node);
            const exec_operation = find_operation_for_node(plugin, node);
            const params = generate_input_params(node);
            const output_data = generate_output_data(node);
            sandbox.runInProcess((node, config, global_data_store, plugin, exec_operation, params, output_data) => {
                const path = require("path");
                return new Promise(async (resolve, reject) => {
                    try {
                        let result = null;
                        switch (plugin.language) {
                            case "nodejs":
                                const plugin_require = require(path.normalize(config.pluginsPath + "/" + plugin.id + "/index.js"));
                                result = await plugin_require[exec_operation['method']](params);
                                break;
                            default:
                                throw new Error('尚未支持当前插件的语言');
                        }

                        console.log("开始节点执行完成");
                        resolve(result);

                    } catch (e) {
                        reject(e);
                    }
                });

            }, [node, config, global_data_store, plugin, exec_operation, params, output_data], {
                timeout: !!general_property["execution_timeout"] ? _.toNumber(general_property["execution_timeout"]) : 0,
                delay: !!general_property["delayed_execution_time"] ? _.toNumber(general_property["delayed_execution_time"]) : 0,
                retry: !!general_property["retry_count"] ? _.toNumber(general_property["retry_count"]) : 0,
                wait_on_complete: !!general_property["waiting_time_after_execution"] ? _.toNumber(general_property["waiting_time_after_execution"]) : 0,
                wait_for_retry: !!general_property["retry_interval"] ? general_property["retry_interval"] : 0
            }).then((result) => {
                console.log("sandbox result >>>>>>>>", result);
                if (!!output_data) {
                    if (output_data.is_allow_global_use && output_data.value) {
                        global_data_store[output_data.value] = result;
                    }
                }

                resolve(result);

            }).catch((error) => {
                reject(error);
            });

        } catch (e) {
            reject(e);
        }
    });

    return promise;

};

/**
 * TODO:
 * - 执行条件选择节点
 * @param {*} node
 */
const execute_conditional_node = async (node, temp_params) => {
    console.log('-=-=-=-=-=-=-=', node);
    runner.log('execute_conditional_node>>>>>>>', node);
    const promise = new Promise(async (resolve, reject) => {
        let result = null;
        try {
            const plugin = find_plugin_for_node(local_plugins, node);
            const exec_operation = find_operation_for_node(plugin, node);
            generate_input_params(node, temp_params);
            const conditions = node.input[0].properties[0].value;
            console.log("execute_conditional_node>>>>>>>>", conditions);

            const plugin_require = require(path.normalize(config.pluginsPath + "/" + plugin.id + "/index.js"));
            result = await plugin_require[exec_operation['method']](conditions, global_data_store);
            console.log('execute_conditional_node>>>>>>>result', result, global_data_store);
            const output_data = generate_output_data(node);
            if (!!output_data) {
                if (output_data.is_allow_global_use && output_data.value) {
                    global_data_store[output_data.value] = result;
                }
            }

            resolve(result);
        } catch (e) {
            runner.error('execute_conditional_node>>>>>>>', e);
            reject(handleCatchError(e));
        }
    });

    return promise;
};

/**
 * 执行循环节点
 * @param {*} node
 */
const execute_circulation_node = async (node, temp_params, isSideRoad) => {
    runner.log('execute_circulation_node>>>>>>>', node);
    const promise = new Promise((resolve, reject) => {
        try {
            const plugin = find_plugin_for_node(local_plugins, node);
            const exec_operation = find_operation_for_node(plugin, node);
            const params = generate_input_params(node, temp_params);
            const nodes = project_profile.nodes;
            const output_key = node.output.value;
            console.log('-=-==-=-=-xunhuan node=-=-=-=-=-=');
            console.log(node);

            const next_lines = _.filter(find_next_lines(project_profile, node), (line) => {
                const SIDE_ROAD_ANCHORS = [1, 3];
                return SIDE_ROAD_ANCHORS.includes(line.sourceAnchor);
            });

            console.log('-=-=-=-=-11111111111=-=-=-=-==params=');
            // console.log(next_lines);
            console.log(params, params.array);
            console.log(params.array);
            console.log('jsonDeepParse>>>>>>>>', jsonDeepParse(params.array));
            // console.log(params.array.length);
            console.log('-=-=-=-=-11111111111=-=-=-=-==params=');
            if (Array.isArray(params.array) && params.array.length > 0) {
                let array = params.array;
                console.log('-=-=-=-=-22222222222=-=-=-=-==params=', global_data_store);
                // console.log(typeof array);
                // console.log(Array.isArray(array));
                // console.log(array);
                // console.log('-=-=-=-=-22222222222=-=-=-=-==params=');
                const series = {};
                _.forEach(array, (data, index) => {
                    series[index] = (callback) => {
                        let tasks = {};
                        if (next_lines && next_lines.length > 0) {
                            tasks[node.id] = (taskcallback) => {
                                try {
                                    let next_execute_node_ids = _.map(next_lines, 'target');
                                    console.warn(next_execute_node_ids)
                                    taskcallback(null, {
                                        next_execute_nodes: next_execute_node_ids
                                    });
                                } catch (e) {
                                    console.log(e);
                                    taskcallback(handleCatchError(e));
                                }
                            };
                            _.forEach(next_lines, (line) => {
                                const next_node = _.find(nodes, {
                                    id: line.target
                                });
                                console.log('-----------1------------------------------', create_tasks(next_node, {
                                    [output_key]: data
                                }, true));
                                console.log({
                                    [output_key]: data
                                })
                                tasks = _.assignIn(tasks, create_tasks(next_node, {
                                    [output_key]: data
                                }, true));
                            });

                            console.log('-=-=-=-=-11111111111=-=-=-=-==tasks=', tasks);

                            async.auto(tasks, (err, results) => {
                                console.error(err, results);
                                if (err) {
                                    callback(err, null);
                                    return false;
                                }

                                callback(null, results);
                            });
                        }

                    }
                });
                console.log('-=-=-=-=-11111111111=-=-=-=-==series=');
                console.log(series);
                console.log('-=-=-=-=-11111111111=-=-=-=-==series=');

                async.series(series, (err, results) => {
                    console.log('series resuls>>>>>>>>', err, results);
                    if (err) {
                        throw err;
                    }

                    resolve(results);
                });
            } else {
                console.log('-=-=-=-=-3333333333333333=-=-=-=-==params=');
                resolve({});
            }
        } catch (e) {
            reject(handleCatchError(e));
        }
    });
    return promise;
}

/**
 * TODO:
 * - 执行常规节点
 * @param {*} node
 */
const execute_convention_node = async (node, temp_params, isSideRoad) => {
    const promise = new Promise(async (resolve, reject) => {
        try {
            const general_property = get_general_property(node);
            const plugin = find_plugin_for_node(local_plugins, node);
            const exec_operation = find_operation_for_node(plugin, node);
            const params = generate_input_params(node, temp_params);
            const output_data = generate_output_data(node);
            sandbox.runInProcess((node, config, global_data_store, plugin, exec_operation, params, project_profile) => {
                const path = require("path");
                const fs = require("fs");
                const pyutil = require(path.resolve() + '/public/utils/pyutil');
                const sys_site_packages_dir = path.join(path.resolve(), '\\env\\python\\win32\\Lib\\site-packages');
                return new Promise(async (resolve, reject) => {
                    try {
                        let result = null;
                        params['uiauto_config'] = {
                            'project_name': project_profile.project_name,
                            'project_dir': path.join(config.projectsPath, '\\' + project_profile.project_name)
                        };
                        switch (plugin.language) {
                            case "nodejs":
                                const plugin_require = require(path.normalize(config.pluginsPath + "/" + plugin.id + "/index.js"));
                                result = await plugin_require[exec_operation['method']](params);
                                break;
                            case "python":
                                const py_path = path.normalize(config.pluginsPath + '/' + plugin.id + "/index.py");

                                fs.writeFileSync(path.join(sys_site_packages_dir, '\\user-site-packages.pth'), path.join(path.dirname(py_path), '\\site-packages'));

                                params.method = exec_operation['method'];

                                result = await pyutil.execute_python(py_path, params, {
                                        is_program: true,
                                        is_keep_running: true
                                    });
                                if (result.success) {
                                    result = result.data;
                                } else {
                                    throw new Error(result.errorMsg);
                                }
                                fs.unlinkSync(path.join(sys_site_packages_dir, '\\user-site-packages.pth'));
                                break;
                            default:
                                throw new Error('尚未支持当前插件的语言');
                        }

                        resolve(result);

                    } catch (e) {
                        reject(e);
                        fs.existsSync(path.join(sys_site_packages_dir, '\\user-site-packages.pth'))
                            && fs.unlinkSync(path.join(sys_site_packages_dir, '\\user-site-packages.pth'));
                    }
                });

            }, [node, config, global_data_store, plugin, exec_operation, params, project_profile], {
                timeout: !!general_property["execution_timeout"] ? _.toNumber(general_property["execution_timeout"]) : 0,
                delay: !!general_property["delayed_execution_time"] ? _.toNumber(general_property["delayed_execution_time"]) : 0,
                retry: !!general_property["retry_count"] ? _.toNumber(general_property["retry_count"]) : 0,
                wait_on_complete: !!general_property["waiting_time_after_execution"] ? _.toNumber(general_property["waiting_time_after_execution"]) : 0,
                wait_for_retry: !!general_property["retry_interval"] ? general_property["retry_interval"] : 0
            }).then((result) => {
                console.log("sandbox result >>>>>>>>", result);
                // 是否有设置接收返回值的变量名
                if (!!output_data) {

                    // 该返回值是否允许被全局使用
                    if (output_data.is_allow_global_use && output_data.value) {
                        global_data_store[output_data.value] = result;
                    }
                }

                resolve(result);
            }).catch((error) => {
                console.log("execute_convention_node runInProcess>>>>>>>>", error);
                reject(error);
            });

        } catch (e) {
            reject(e);
        }
    });

    return promise;
};

/**
 * TODO:
 * - 执行脚本节点
 * @param {*} node
 */
const execute_script_node = async (node, temp_params) => {
    const promise = new Promise(async (resolve, reject) => {

        try {
            const general_property = get_general_property(node);
            const plugin = find_plugin_for_node(local_plugins, node);
            const exec_operation = find_operation_for_node(plugin, node);
            const params = generate_input_params(node, temp_params);
            const output_data = generate_output_data(node);
            sandbox.runInProcess((node, config, global_data_store, plugin, exec_operation, params, project_profile) => {
                const path = require("path");
                const fs = require("fs");
                const fse = require('fs-extra');
                const pyutil = require(path.resolve() + '/public/utils/pyutil');
                const sys_site_packages_dir = path.join(path.resolve(), '\\env\\python\\win32\\Lib\\site-packages');
                return new Promise(async (resolve, reject) => {
                    try {
                        let result = null;
                        params['uiauto_config'] = {
                            'project_name': project_profile.project_name,
                            'project_dir': path.join(config.projectsPath, '\\' + project_profile.project_name)
                        };
                        switch (plugin.language) {
                            case "nodejs":
                                const plugin_require = require(path.normalize(config.pluginsPath + "/" + plugin.id + "/index.js"));
                                result = await plugin_require[exec_operation['method']](params, global_data_store);
                                break;
                            case "python":

                                let fileName = uuidv4() + '.py';
                                const py_path = path.normalize(config.pluginsPath + '/' + plugin.id + `../scripts/${fileName}`);
                                params.code = 'def script(store):\n    ' + params.code.replace(/\n/g, "\n    ") + '\n\ndef main(params):\n    try:\n        result = script(params)\n    except:\n        result = \'ERROR\'\n    return result';
                                fse.outputFileSync(py_path, params.code, 'utf8');

                                fs.writeFileSync(path.join(sys_site_packages_dir, '\\user-site-packages.pth'), path.join(path.dirname(py_path), '\\site-packages'));

                                params.method = exec_operation['method'];

                                result = await pyutil.execute_python(py_path, _.extend(global_data_store, params), {
                                    is_program: true,
                                    is_keep_running: true
                                });
                                if (result.success) {
                                    result = result.data;
                                } else {
                                    throw new Error(result.errorMsg);
                                }
                                fs.unlinkSync(py_path);
                                fs.unlinkSync(path.join(sys_site_packages_dir, '\\user-site-packages.pth'));
                                break;
                            default:
                                throw new Error('尚未支持当前插件的语言');
                        }

                        resolve(result);

                    } catch (e) {
                        reject(e);
                        fs.existsSync(path.join(sys_site_packages_dir, '\\user-site-packages.pth'))
                        && fs.unlinkSync(path.join(sys_site_packages_dir, '\\user-site-packages.pth'));
                    }
                });

            }, [node, config, global_data_store, plugin, exec_operation, params, project_profile], {
                timeout: !!general_property["execution_timeout"] ? _.toNumber(general_property["execution_timeout"]) : 0,
                delay: !!general_property["delayed_execution_time"] ? _.toNumber(general_property["delayed_execution_time"]) : 0,
                retry: !!general_property["retry_count"] ? _.toNumber(general_property["retry_count"]) : 0,
                wait_on_complete: !!general_property["waiting_time_after_execution"] ? _.toNumber(general_property["waiting_time_after_execution"]) : 0,
                wait_for_retry: !!general_property["retry_interval"] ? general_property["retry_interval"] : 0
            }).then((result) => {
                console.log("sandbox result >>>>>>>>", result);
                // 是否有设置接收返回值的变量名
                if (!!output_data) {

                    // 该返回值是否允许被全局使用
                    if (output_data.is_allow_global_use && output_data.value) {
                        global_data_store[output_data.value] = result;
                    }
                }

                resolve(result);
            }).catch((error) => {
                console.error("sandbox error >>>>>>>>", error);
                reject(error);
            });

        } catch (e) {
            reject(e);
        }

    });

    return promise;
};

/**
 * TODO:
 * - 执行结束节点
 * @param {*} node
 */
const execute_end_node = async (node) => {
    const promise = new Promise(async (resolve, reject) => {
        try {
            const general_property = get_general_property(node);
            const plugin = find_plugin_for_node(local_plugins, node);
            const exec_operation = find_operation_for_node(plugin, node);
            const params = generate_input_params(node);
            const output_data = generate_output_data(node);
            sandbox.runInProcess((node, config, global_data_store, plugin, exec_operation, params, output_data) => {
                const path = require("path");
                return new Promise(async (resolve, reject) => {
                    try {
                        let result = null;
                        switch (plugin.language) {
                            case "nodejs":
                                const plugin_require = require(path.normalize(config.pluginsPath + "/" + plugin.id + "/index.js"));
                                result = await plugin_require[exec_operation['method']](params);
                                break;
                            default:
                                throw new Error('尚未支持当前插件的语言');
                        }

                        console.log("开始节点执行完成");
                        resolve(result);

                    } catch (e) {
                        reject(e);
                    }
                });

            }, [node, config, global_data_store, plugin, exec_operation, params, output_data], {
                timeout: !!general_property["execution_timeout"] ? _.toNumber(general_property["execution_timeout"]) : 0,
                delay: !!general_property["delayed_execution_time"] ? _.toNumber(general_property["delayed_execution_time"]) : 0,
                retry: !!general_property["retry_count"] ? _.toNumber(general_property["retry_count"]) : 0,
                wait_on_complete: !!general_property["waiting_time_after_execution"] ? _.toNumber(general_property["waiting_time_after_execution"]) : 0,
                wait_for_retry: !!general_property["retry_interval"] ? general_property["retry_interval"] : 0
            }).then((result) => {
                console.log("sandbox result >>>>>>>>", result);
                if (!!output_data) {
                    if (output_data.is_allow_global_use && output_data.value) {
                        global_data_store[output_data.value] = result;
                    }
                }

                resolve(result);

            }).catch((error) => {
                reject(error);
            });

        } catch (e) {
            reject(e);
        }
    });

    return promise;
};

/**
 * 获取通用配置属性字段
 * @param node
 */
const get_general_property = (node) => {
    let result = {};
    try {
        const general_property = node.general_property;
        _.forEach(general_property, (property) => {
            result[property.id] = property.value;
        });
    } catch (e) {
        throw handleCatchError(e);
    }

    return result;
};

/**
 * TODO:
 * - 生成入参
 * @param {object} global_data_store
 * @param {object} node
 */
const generate_input_params = (node, temp_params) => {
    let params = {};
    try {
        if (typeof node.input !== "undefined" && node.input !== null && node.input !== "") {
            const inputs = node.input;
            runner.log('generate_input_params>>>>>inputs', inputs);
            if (typeof inputs !== 'undefined' && inputs !== null) {
                _.forEach(inputs, (input) => {
                    _.forEach(input.properties, (property) => {
                        runner.log('generate_input_params>>>>>property.value', property.value);
                        runner.log(property);
                        if (typeof property.value !== 'undefined' && property.value !== null) {

                            temp_params = (typeof temp_params !== 'undefined' && temp_params !== null) ? temp_params : {};
                            let global_data_store_temp_params = _.extend(global_data_store, temp_params);
                            let temp = global_data_store_temp_params;

                            params = _.assignIn(params, analytical_expression(property, temp));
                        }
                    });
                });
            } else {
                throw new Error('json parse error');
            }
        }
    } catch (e) {
        handleCatchError(e)
    }
    runner.log('-=-=-=-=-=params-=-=-=-=');
    runner.log(params);
    runner.log('-=-=-=-=-=params-=-=-=-=');
    return params;

};

const analytical_expression = (property, global_data) => {
    let result = {};
    const keys = _.keys(global_data);
    const values = _.values(global_data);
    if (!!property.value) {
        if (_.isArray(property.value)) {
            result[property.id] = [];
            _.forEach(property.value, (value) => {
                result[property.id].push(analytical_expression(value, global_data));
            });
        } else {
            try {
                property.value = JSON.parse(property.value);
            } catch (e) {

            }

            if (_.isString(property.value)) {
                const value_match = property.value.match(/\${(.*?)}/g);
                console.log("value_match>>>>>>>>>", value_match);
                if (!!value_match && value_match.length > 0) {
                    let temp_value = property.value;
                    if (value_match.length === 1) {
                        const value = value_match[0];
                        const field = value.replace(/\${|}/g, "");
                        const fun = new Function(keys, "return typeof " + field + " !== 'undefined' ? " + field + " : null");
                        temp_value = fun(...values);
                        console.log("analytical_expression>>>>>>>", temp_value);
                    } else {
                        _.forEach(value_match, (value) => {
                            const field = value.replace(/\${|}/g, "");
                            const fun = new Function(keys, "return typeof " + field + " !== 'undefined' ? " + field + " : null");
                            const field_value = fun(...values);
                            temp_value = temp_value.replace(eval("/" + value + "/g"), JSON.stringify(field_value));
                        })
                    }

                    result[property.id] = temp_value;
                } else {
                    result[property.id] = property.value
                }
            } else {
                if (_.isObject(property.value)) {
                    result[property.id] = {};
                    const obj_keys = _.keys(property.value);
                    _.forEach(obj_keys, (key) => {
                        result[property.id][key] = analytical_expression({id: "result", value: property.value[key]}, global_data).result
                    });
                } else {
                    result[property.id] = property.value
                }
            }
        }
    } else {
        result[property.id] = ""
    }

    return result;
};

/**
 * 生成出参对象
 * @param {object} node
 */
const generate_output_data = (node) => {
    let result = {};

    try {
        if (typeof node.output !== 'undefined' && node.output !== null && node.output !== "") {
            result = node.output;
        } else {
            result = null;
        }
    } catch (e) {
        throw handleCatchError(e);
    }

    return result
};

/**
 * TODO:
 * - 查找节点所用的插件配置
 * @param {Array} local_plugins
 * @param {object} node
 */
const find_plugin_for_node = (local_plugins, node) => {

    let plugin = null;
    const plugins_path = path.normalize(config.pluginsPath + '/');
    const package_json_path = path.normalize(plugins_path + node.plugin_id + "/package.json");
    if (fs.existsSync(package_json_path)) {
        plugin = fse.readJsonSync(package_json_path);
    } else {
        throw new Error('插件不存在：' + JSON.stringify({
            plugin_id: node.plugin_id
        }));
    }

    return plugin;
};

/**
 * TODO:
 * - 查找节点的操作配置
 * @param {object} plugin
 * @param {object} node
 */
const find_operation_for_node = (plugin, node) => {
    let exec_operation = null;

    if (typeof plugin !== 'undefined' && plugin !== null) {
        const operations = plugin.uiauto_config.operations;
        if (typeof operations !== 'undefined' && operations !== null && operations.length > 0) {
            exec_operation = _.find(operations, {
                operation_id: node.operation_id
            });
            if (typeof exec_operation === 'undefined' || exec_operation === null) {
                throw new Error('没有对应的插件操作');
            }
        } else {
            throw new Error('插件没有定义操作：' + JSON.stringify({
                plugin_id: node.plugin_id
            }));
        }
    } else {
        throw new Error('插件不存在：' + JSON.stringify({
            plugin_id: node.plugin_id
        }));
    }

    return exec_operation;
};

/**
 * TODO:
 * - 查找起始节点
 * @param {Array} nodes 节点数组
 */
const find_first_node = (nodes) => {
    return _.find(nodes, {
        shapeType: "Start"
    });
};

/**
 * TODO:
 * - 查找结束节点
 * @param {Array} nodes
 */
const find_end_node = (nodes) => {
    return _.find(nodes, {
        shapeType: "End"
    });
};

/**
 * TODO:
 * - 查找以当前节点为起点的所有下一节点
 * @param {object} project_profile
 * @param {object} source_node
 */
const find_next_node = (project_profile, source_node, line_label) => {
    let next_node = null;
    const nodes = project_profile.nodes;
    const edges = project_profile.edges;

    const lines = _.filter(edges, {
        source: source_node.id
    });
    _.forEach(lines, (line) => {
        const node = _.find(nodes, {
            id: line.target
        });
        if (typeof node !== 'undefined' && node !== null) {
            if (typeof line_label !== 'undefined') {
                if (line.label === line_label) {
                    next_node = node;
                }
            } else {
                next_node = node;
            }
        }
    });

    return next_node;
};

/**
 * TODO:
 * - 查找以当前节点为起点的所有线路
 * @param {object} project_profile
 * @param {object} source_node
 */
const find_next_lines = (project_profile, source_node) => {

    runner.log('find_next_lines>>>>>>>>>>>', source_node);
    if (typeof source_node === 'undefined' || source_node === null) {
        throw new Error('节点不存在');
    }

    const edges = project_profile.edges;

    let next_lines = _.filter(edges, {source: source_node.id});

    return next_lines;
};

/**
 * TODO:
 * - 查找以当前节点为终点的的所有线路
 * @param {*} project_profile
 * @param {*} node
 */
const find_prev_lines = (project_profile, node) => {
    runner.log('find_prev_lines>>>>>>>>>>>', node);
    let prev_lines = [];
    if (typeof node === 'undefined' || node === null) {
        throw new Error('节点不存在');
    }

    const edges = project_profile.edges;
    prev_lines = _.filter(edges, {
        target: node.id
    });

    return prev_lines;
};

/**
 * TODO:
 * - 查找以当前节点为起点的异常处理线路
 * @param {object} project_profile
 * @param {object} source_node
 */
const find_exception_lines = (project_profile, source_node) => {

    runner.log('find_next_lines>>>>>>>>>>>', source_node);
    if (typeof source_node === 'undefined' || source_node === null) {
        throw new Error('节点不存在');
    }

    const edges = project_profile.edges;

    let next_lines = _.filter(edges, (line) => {
        let result = false;
        if (line.source === source_node.id) {
            let target_node = _.find(project_profile.nodes, {id: line.target});
            if (target_node && target_node.shapeType === "Abnormal") {
                result = true;
            }
        }

        return result;
    });
    return next_lines;
};

var setLogMode = (options) => {
    if (options.silent) {
        runner.log = () => { };
        runner.warn = () => { };
        runner.error = () => { };
    }
}

var jsonDeepParse = (element) => {
    let pre, curr = element;
    while (pre != curr) {
        try {
            pre = curr;
            curr = JSON.parse(curr);
        } catch (error) { }
    }
    return curr;
}

const handleCatchError = (error)=> {
    if (_.isError(error)) {
        return error.message;
    } else {
        if (_.isObject(error)) {
            return JSON.stringify(error);
        } else {
            return error;
        }
    }

};

/**
 * TODO:
 * - 界面控制台输出日志
 * @type {{warn: uiLog.warn, writeLog: uiLog.writeLog, log: uiLog.log, error: uiLog.error}}
 */
const uiLog = {
    log: (str) => {
        str = moment().format("YYYY-MM-DD HH:mm:ss") + " [log] " + " " + str;
        current_task_logs.push(str);
        writeLog(str);
    },
    warn: (str) => {
        str = moment().format("YYYY-MM-DD HH:mm:ss") + " [warn] " + " " + str;
        current_task_logs.push(str);
        writeLog(str);
    },
    error: (str) => {
        str = moment().format("YYYY-MM-DD HH:mm:ss") + " [error] " + " " + str;
        global_data_store['uiauto_error'] = "【" + project_profile.project_name + "】项目执运行失败，异常详情如何下：\n" + str;
        current_task_logs.push(str);
        writeLog(str);
    },
    success: (str) => {
        str = moment().format("YYYY-MM-DD HH:mm:ss") + " [success] " + " " + str;
        current_task_logs.push(str);
        writeLog(str);
    }
};

const writeLog = (str) => {
    const log_file = `${path.resolve()}/.uiauto/${project_profile.project_name}/.uiauto.log`;
    const GAP = os.platform === 'win32' ? '\n\r' : '\n';
    try {
        fse.outputFileSync(log_file, str + GAP, {
            encoding: 'utf8',
            flag: 'a'
        })
    } catch (error) {
        console.log('-=-=-=-=error-=-=-=-=-');
        console.log(error);
    }
}
