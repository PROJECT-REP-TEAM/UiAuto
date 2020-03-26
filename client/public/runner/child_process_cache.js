let _;
if (process.env.isWorker === 'true') {
    _ = require('lodash');
} else {
    _ = window.require('lodash');
}

var processes_manager = {}


exports.views = function (project_name) {
    // 查看子进程
    if (project_name) return typeof processes_manager[project_name] === 'undefined' ? [] : processes_manager[project_name];
    else return processes_manager;
}

exports.record = function (project_name, child) {
    // 记录子进程
    (!processes_manager || !processes_manager[project_name]) && (processes_manager[project_name] = []);
    processes_manager[project_name].push(child);
}

exports.remove = function (project_name, child) {
    // 剔除子进程记录
    if (processes_manager && processes_manager[project_name]) {
        _.remove(processes_manager[project_name], process => {
            // console.log('---------remove---------');
            // console.log(process.pid, child.pid);
            // console.log('---------remove---------');
            return process.pid === child.pid;
        })
    }
}

exports.stop = function (project_name) {
    if (!processes_manager || !processes_manager[project_name] || !processes_manager[project_name].length) return;
    _.each(processes_manager[project_name], process => {
        try {
            process.kill();
        } catch (error) {

        }
    })
    
}
