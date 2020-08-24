const shell = require('./js_shell');
const fse = require('fs-extra');
const {
    PythonShell
} = require('python-shell');
const path = require('path');
const uuid = require('uuid');
const os = require('os')
const config = fse.readJsonSync(`${os.homedir()}/.uiauto/uiauto.conf`);
const moment = require('moment');
const {execSync} = require('child_process');
const EventEmitter = require('events').EventEmitter;
let listener = new EventEmitter();
const electron = require("electron");
const delay = require('delay');

const cleanProcess = () => {
    try {
        // 清理chromedriver进程
        let taskkill_shell = execSync('taskkill /f /im "chromedriver.exe" 2>nul')
        console.log(taskkill_shell.toString())
    } catch (e) {
        // console.error('清理chromedriver进程错误：', e)
    }

    try {
        // 清理iedrvierserver.exe进程
        let taskkill_shell = execSync('taskkill /f /im "IEDriverServer.exe" 2>nul')
        console.log(taskkill_shell.toString())
    } catch (e) {
        // console.error('清理IEDriverServer进程错误：', e)
    }
};

exports.start = () => {
    window['socket_client'] = shell.setup();

    return start_executor();
};

exports.restart = () => {
    console.log('-----------重启执行器进程-----------');
    !!window['socket_client'] && shell.destroy(window['socket_client']);
    window['py_shell'].terminate();

    if (!!window['socket_client']) {
        window['socket_client'] = shell.setup();
    }
    window['py_shell'] = start_executor();

    listener = new EventEmitter();
};

const listen_logger = (log_dir, log_file, options) => {

    if (!fs.existsSync(log_dir)) {
        fs.mkdirSync(log_dir)
    }
    fs.writeFileSync(log_file, "");

    fs.watchFile(log_file, {
        persistent: true,
        interval: 100
    }, function (curr, prev) {

        if (curr.mtime >= prev.mtime) {
            //文件内容有变化，那么通知相应的进程可以执行相关操作。例如读物文件写入数据库等
            let buffer = new Buffer(curr.size - prev.size);
            const fd = fs.openSync(log_file, "a+");
            fs.readSync(fd, buffer, 0, (curr.size - prev.size), prev.size);

            // newCB(buffer.toString().replace("\n", "<br>"));
            const lines = buffer.toString().split("[line:]");
            _.forEach(lines, async (line) => {
                console.log(line)
                const logItem = {}
                line = line.replace("[line:]", "").replace(/\\n/g, "<br>")
                if (line.indexOf("[error]") > -1) {
                    logItem['type'] = 'error'
                    logItem['color'] = '#e65d6e'
                    logItem['line'] = line
                    // line = "<span style='color: #e65d6e'>" + line + "</span>"
                }
                if (line.indexOf("[warn]") > -1) {
                    logItem['type'] = 'warn'
                    logItem['color'] = '#fec171'
                    logItem['line'] = line
                    // line = "<span style='color: #fec171'>" + line + "</span>"
                }
                if (line.indexOf("[success]") > -1) {
                    logItem['type'] = 'success'
                    logItem['color'] = 'grenn'
                    logItem['line'] = line
                    // line = "<span style='color: green'>" + line + "</span>"
                }
                if (line.indexOf("[info]") > -1) {
                    logItem['type'] = 'info'
                    logItem['color'] = 'blue'
                    logItem['line'] = line
                    // line = "<span style='color: green'>" + line + "</span>"
                }
                if (line.indexOf("[log]") > -1) {
                    logItem['type'] = 'log'
                    logItem['color'] = 'white'
                    logItem['line'] = line
                    // line = "<span style='color: green'>" + line + "</span>"
                }

                if (!!options && options.newCB) {
                    options.newCB(logItem);
                }

                // if (!!options && options.updateLog) {
                //     if (logItem['type'] != "log") {
                //         try {
                //             await options.updateLog({
                //                 "deviceId": config.deviceId,
                //                 "project_name": options.project_name,
                //                 "taskId": options.task_id,
                //                 "status": logItem['type'],
                //                 "content": logItem['line']
                //             });
                //         } catch (e) {
                //             console.log(e);
                //         }
                //     }
                // }

                // await delay(1000)
            });
        } else {
            console.log('文件读取错误');
        }
    });
    console.log(log_file + ' 被监听中...');
};

const start_recording = (project_name) => {
    return new Promise((resolve, reject) => {
        const save_path = path.normalize(`${os.homedir()}/.uiauto/screenrecorder/${project_name}`);
        console.log(save_path)

        let options = {
            mode: 'text',
            pythonPath: path.join(path.resolve() + "/env/python/win32/python.exe"),
            // pythonOptions: ["-u"],
            args: [save_path]
        };

        const ls = new PythonShell(path.normalize(`${path.resolve()}\\public\\base_integration\\uiauto_executor\\base\\screenrecorder\\index.py`), options);

        ls.stdout.on('data', (data) => {
            console.log("stdout>>>>>>>>>>>>>", data);
        });

        ls.stderr.on('data', (data) => {
            console.log("stderr>>>>>>>>>>>>>", data);
        });

        setTimeout(() => {
            resolve(ls)
        }, 1000)
    });

};

exports.execute = async (project_name, params, options) => {
    return new Promise(async (resolve, reject) => {
        let record_shell = null;
        const executor_params = {};
        executor_params["log_file"] = path.normalize(`${os.homedir()}\\.uiauto\\${project_name}\\${moment().format("YYYYMMDD_HHmmss_SSS")}.log`)
        try {

            // 清理多余进程
            // cleanProcess();

            const screenInfo = {};
            let primaryScreen = electron.screen.getPrimaryDisplay();
            screenInfo['scale'] = primaryScreen.scaleFactor;
            screenInfo['width'] = primaryScreen.size.width;
            screenInfo['height'] = primaryScreen.size.height;
            screenInfo['logicWidth'] = primaryScreen.size.width * primaryScreen.scaleFactor;
            screenInfo['logicHeight'] = primaryScreen.size.height * primaryScreen.scaleFactor;

            const project = fse.readJsonSync(`${config.projectsPath}/${project_name}/${project_name}.json`);
            console.log(project);

            if (!!project.automatic_recording) {
                record_shell = await start_recording(project_name)
            }

            
            executor_params['project_name'] = project_name;
            executor_params['params'] = params;
            executor_params['environment_options'] = {
                "client_dir": path.resolve(),
                "plugins_dir": config.pluginsPath,
                "projects_dir": config.projectsPath,
                "executor_dir": path.normalize(`${path.resolve()}\\public\\base_integration\\uiauto_executor`),
                "sys_site_packages_dir": path.join(path.resolve(), '\\env\\python\\win32\\Lib\\site-packages'),
                "user_site_packages_dir": path.join(os.homedir(), '\\.uiauto\\site-packages'),
                "log_file": path.normalize(`${os.homedir()}\\.uiauto\\${project_name}\\${moment().format("YYYYMMDD_HHmmss_SSS")}.log`),
                "screen_information": screenInfo,
                "server_url": config.serverUrl,
                "device_id": config.deviceId
            };

            listen_logger(path.normalize(`${os.homedir()}\\.uiauto\\${project_name}`),
                executor_params['environment_options']['log_file'], options);

            const result = await send_command('execute_project', project_name, executor_params);
            resolve(result);

        } catch (e) {
            reject(e);
        }

        console.log("移除日志文件监听")
        fs.unwatchFile(executor_params["log_file"]);

        if (record_shell) {
            setTimeout(() => {
                record_shell.terminate()
            }, 3000)

        }
    });

};

exports.execute_node = (project_name, params, newCB) => {
    return new Promise(async (resolve, reject) => {
        const executor_params = {};
        executor_params["log_file"] = path.normalize(`${os.homedir()}\\.uiauto\\${project_name}\\${moment().format("YYYYMMDD_HHmmss_SSS")}.log`)
        
        try {
            
            console.log("execute_node>>>>>>>>", project_name);
            executor_params['project_name'] = project_name;
            executor_params['params'] = params;
            executor_params['environment_options'] = {
                "client_dir": path.resolve(),
                "plugins_dir": config.pluginsPath,
                "projects_dir": config.projectsPath,
                "executor_dir": path.normalize(`${path.resolve()}\\public\\base_integration\\uiauto_executor`),
                "sys_site_packages_dir": path.join(path.resolve(), '\\env\\python\\win32\\Lib\\site-packages'),
                "user_site_packages_dir": path.join(os.homedir(), '\\.uiauto\\site-packages')
            };

            listen_logger(path.normalize(`${os.homedir()}\\.uiauto\\${project_name}`), executor_params['environment_options']['log_file'], newCB);

            const result = await send_command('execute_node', project_name, executor_params);
            resolve(result)
        } catch (e) {
            reject(e);
            listener.removeAllListeners();
        }

        fs.unwatchFile(executor_params["log_file"])
    });
};

const send_command = (command, project_name, executor_params) => {
    return new Promise((resolve, reject) => {
        try {
            const temp_dir = path.normalize(`${path.resolve()}\\.uiauto\\temp\\`);
            if (!fs.existsSync(temp_dir)) {
                fs.mkdirSync(temp_dir);
            }
            const param_file_name = project_name + "_" + uuid.v4() + "_.txt";
            const param_file_path = temp_dir + param_file_name;
            fs.writeFileSync(param_file_path, JSON.stringify(executor_params));

            listener.on('success', (data) => {
                fs.existsSync(param_file_path) && fs.unlinkSync(param_file_path);
                const result_file_path = param_file_path.replace('.txt', '_result.txt');
                const result = fs.existsSync(result_file_path) ? JSON.parse(fs.readFileSync(result_file_path)) : null;
                console.log('result>>>>>>>>>>>>', result);
                if (result.success) {
                    resolve(result.message);
                } else {
                    reject(result.error)
                }
                listener.removeAllListeners();
                fs.existsSync(result_file_path) && fs.unlinkSync(result_file_path);
            });

            listener.on("error", (error) => {
                reject(error);
                listener.removeAllListeners();
                fs.existsSync(param_file_path) && fs.unlinkSync(param_file_path);
            });

            window['py_shell'].send(command + " " + encodeURIComponent(param_file_path) + "\n");

        } catch (e) {
            reject(e);
        }
    });
};

exports.execute_python = (py_path, method, params) => {
    return new Promise(async (resolve, reject) => {
        try {
            const py_info = path.parse(py_path);
            const executor_params = {};
            executor_params['client_dir'] = path.resolve();
            executor_params['py_dir'] = py_info.dir;
            executor_params['py_name'] = py_info.name;
            executor_params['py_path'] = py_path;
            executor_params['method'] = method;
            executor_params['executor_dir'] = path.normalize(`${path.resolve()}\\public\\base_integration\\uiauto_executor`);
            executor_params['sys_site_packages_dir'] = path.join(path.resolve(), '\\env\\python\\win32\\Lib\\site-packages');
            executor_params['params'] = params;
            executor_params['environment_options'] = {
                "client_dir": path.resolve(),
                "py_dir": py_info.dir,
                "py_name": py_info.name,
                "py_path": py_path,
                "method": method,
                "executor_dir": path.normalize(`${path.resolve()}\\public\\base_integration\\uiauto_executor`),
                "sys_site_packages_dir": path.join(path.resolve(), '\\env\\python\\win32\\Lib\\site-packages')
            };

            const temp_dir = path.normalize(`${path.resolve()}\\.uiauto\\temp\\`);
            if (!fs.existsSync(temp_dir)) {
                fs.mkdirSync(temp_dir);
            }
            const param_file_name = "execute_python_" + uuid.v4() + ".txt";
            const param_file_path = temp_dir + param_file_name;
            fs.writeFileSync(param_file_path, JSON.stringify(executor_params));

            listener.on('success', (data) => {
                fs.existsSync(param_file_path) && fs.unlinkSync(param_file_path);
                const result_file_path = param_file_path.replace('.txt', '_result.txt');
                const result = fs.existsSync(result_file_path) ? JSON.parse(fs.readFileSync(result_file_path)) : null;
                console.log('result>>>>>>>>>>>>', result);
                resolve(result);
                listener.removeAllListeners();
                fs.existsSync(result_file_path) && fs.unlinkSync(result_file_path);
            });

            listener.on("error", (error) => {
                reject(error);
                fs.existsSync(param_file_path) && fs.unlinkSync(param_file_path);
                listener.removeAllListeners();
            });

            window['py_shell'].send("execute_python " + encodeURIComponent(param_file_path) + "\n");
        } catch (e) {
            reject(e);
        }
    });
};

const start_executor = () => {
    if (!!window['py_shell']) {
        exports.exit_executor()
    }

    let options = {
        mode: 'text',
        pythonPath: path.join(path.resolve() + "/env/python/win32/python.exe"),
        // pythonOptions: ["-u"],
        args: []
    };

    const ls = new PythonShell(path.normalize(path.resolve() + "\\public\\base_integration\\uiauto_executor\\command.py"), options);

    ls.stdout.on('data', (data) => {
        console.log("data>>>>>>>>>>>>>", data);
    });

    ls.stderr.on('data', (data) => {
        if (data === 'finish') {
            listener.emit('success', data);
        } else {
            console.error('data>>>>>>>>>>>>>', data);
            listener.emit('error', data);
        }
    });

    return ls
};

exports.stop_exector = () => {
    // window['py_shell'].terminate()
    window['py_shell'].send("stop ");
    listener.removeAllListeners()
};

exports.exit_executor = () => {
    window['py_shell'].terminate()
}
