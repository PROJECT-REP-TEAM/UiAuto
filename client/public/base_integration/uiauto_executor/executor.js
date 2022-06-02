const fs = require('fs')
const fse = require('fs-extra');
const {
    PythonShell
} = require('python-shell');
const path = require('path');
const uuid = require('uuid');
const os = require('os')
const config = fse.readJsonSync(`${os.homedir()}/.uiauto/uiauto.conf`);
const moment = require('moment');
const {
    execSync,
    fork,
    spawn
} = require('child_process');
const EventEmitter = require('events').EventEmitter;
let listener = new EventEmitter();
const electron = require("@electron/remote");
const _ = require("lodash");

const openFileStore = [];

var record_shell = null;

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
    // window['socket_client'] = shell.setup();
    this.start_js_shell();
    return start_executor();
};


exports.start_js_shell = () => {
    console.log("js shell process start");
    let js_shell_path;
    if (os.platform() === 'darwin' && path.resolve() == '/') {
        js_shell_path = path.normalize(`${path.normalize(electron.app.getPath("exe") + '../../..')}/public/base_integration/uiauto_executor/js_shell.js`)
    } else {
        js_shell_path = path.normalize(`${path.resolve()}/public/base_integration/uiauto_executor/js_shell.js`)
    }
    const ls = fork(js_shell_path, {
        stdio: ["pipe", "pipe", "pipe", "ipc"]
    });

    ls.stdout.on("data", (data) => {
        console.log(data.toString())
    });

    window['js_shell'] = ls;
}


exports.restart = () => {
    console.log('-----------重启执行器进程-----------');
    _.forEach(openFileStore, (fid) => {
        fs.closeSync(fid);
        openFileStore.pop(fid)
    })
    // !!window['socket_client'] && shell.destroy(window['socket_client']);
    window['py_shell'].terminate();

    // if (!!window['socket_client']) {
    //     window['socket_client'] = shell.setup();
    // }
    this.start_js_shell();
    window['py_shell'] = start_executor();

    if (record_shell) {
        record_shell.stdin.setEncoding('utf8');
        record_shell.stdin.write('q');
    }

    listener = new EventEmitter();
};

const listen_logger = (log_dir, log_file, options) => {

    if (!fs.existsSync(log_dir)) {
        fs.mkdirSync(log_dir)
    }
    console.log(log_file)
    fs.writeFileSync(log_file, "");


    // openFileStore.push(fd);
    let lineNo = 0
    fs.watchFile(log_file, {
        persistent: true,
        interval: 100
    }, function (curr, prev) {

        if (curr.mtime >= prev.mtime) {
            //文件内容有变化，那么通知相应的进程可以执行相关操作。例如读物文件写入数据库等
            let buffer = new Buffer(curr.size - prev.size);

            const fd = fs.openSync(log_file, "a+");
            fs.readSync(fd, buffer, 0, (curr.size - prev.size), prev.size);
            fs.closeSync(fd)

            // newCB(buffer.toString().replace("\n", "<br>"));
            const lines = buffer.toString().split("[line:]");
            lines.forEach((line) => {
                lineNo++
                if (!!line && line !== '') {
                    try {
                        line = line.replace(/\"/g, '\\"').replace(/\'/g, '"')
                        try {
                            line = JSON.parse(line)
                        } catch (error) {}
                        if (line['level'] === "") {
                            line['level'] = 'log'
                        }
                        const logItem = {}
                        let levelValue = 0
                        // line = line.replace("[line:]", "").replace(/\\n/g, "<br>")
                        if (line['level'] === 'error') {
                            logItem['color'] = '#e65d6e'
                            levelValue = 4
                        }
                        if (line['level'] === 'warn') {
                            logItem['color'] = '#fec171'
                            levelValue = 2
                        }
                        if (line['level'] === 'success') {
                            logItem['color'] = 'green'
                            levelValue = 6
                        }
                        if (line['level'] === 'info') {
                            logItem['color'] = 'blue'
                            levelValue = 1
                        }
                        if (line['level'] === 'log') {
                            logItem['color'] = 'white'
                            levelValue = 0
                        }

                        logItem['type'] = line['level']
                        logItem['line'] = `${moment(line['time']).format("YYYY-MM-DD HH:mm:ss")} [${line['level']}] ${line['content']}`

                        console.log(logItem['line'])
                        if (!!options && options.newCB) {
                            options.newCB(logItem);
                        }

                        if (options.taskId && options.socket_client && options.socket_client.connected) {
                            console.log(lineNo)
                            options.socket_client.emit('UIAUTO_SAVE_LOG', {
                                "taskId": options.taskId,
                                "content": line['content'],
                                "logType": levelValue,
                                "lineNo": lineNo
                            }, (message) => {
                                console.log('日志保存回调：' + message)
                            })
                        }

                        if (options.localTask && options.LogModel) {
                            options.LogModel.create({
                                taskId: options.localTask.id,
                                logType: line['level'],
                                content: line['content'],
                                lineNo: lineNo
                            })
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }
            })

        } else {
            console.log('文件读取错误');
        }
    });
    console.log(log_file + ' 被监听中...');
};

// 屏幕录制
const start_recording = (project) => {
    return new Promise((resolve, reject) => {
        try {
            // 获取二进制文件
            let pathToFfmpeg;
            if (os.platform() === 'linux') {
                pathToFfmpeg = path.normalize(path.join(path.resolve() + `/env/ffmpeg/linux/ffmpeg`));
            } else if (os.platform() === 'darwin') {
                if (path.resolve() == '/') {
                    pathToFfmpeg = path.normalize(electron.app.getPath("exe") + '../../../env/ffmpeg/darwin/ffmpeg');
                } else {
                    pathToFfmpeg = path.normalize(path.join(path.resolve() + `/env/ffmpeg/darwin/ffmpeg`));
                }
            } else {
                pathToFfmpeg = path.normalize(path.join(path.resolve() + `/env/ffmpeg/win32/ffmpeg.exe`));
            }

            // 设置保存路径
            fse.ensureDirSync(path.normalize(`${project.record_file_path}/${project.project_name}/`))
            const save_path = path.normalize(`${project.record_file_path}/${project.project_name}/${moment().format("YYYYMMDD_HHmmss_SSS")}.mp4`);
            // fse.ensureDirSync(path.normalize(`${os.homedir()}/.uiauto/screenrecorder/${project_name}/`))
            // const save_path = path.normalize(`${os.homedir()}/.uiauto/screenrecorder/${project_name}/${moment().format("YYYYMMDD_HHmmss_SSS")}.mp4`);
            console.log(pathToFfmpeg)
            console.log(save_path)
            // 设置执行语句
            let execArgs = [];
            if (os.platform() === 'win32') {
                execArgs = [`-f`, `gdigrab`, `-i`, `desktop`, `-framerate`, `25`, `-r`, `25`, `-video_size`, `${electron.screen.getPrimaryDisplay().size.width}x${electron.screen.getPrimaryDisplay().size.height}`, `-pix_fmt`, `yuv420p`, `-y`, save_path]
            } else if (os.platform() === 'linux') {
                // 授权执行文件
                execSync(`chmod +x ${pathToFfmpeg}`)
                execArgs = [`-framerate`, `25`, `-f`, `x11grab`, `-i`, `:0.0+0,00`, `-r`, `25`, `-video_size`, `${electron.screen.getPrimaryDisplay().size.width}x${electron.screen.getPrimaryDisplay().size.height}`, `-pix_fmt`, `yuv420p`, `-y`, save_path]
            } else if (os.platform() === 'darwin') {
                // 授权执行文件
                execSync(`chmod +x ${pathToFfmpeg}`)
                execArgs = [`-framerate`, `25`, `-f`, `avfoundation`, `-i`, `0`, `-r`, `25`, `-video_size`, `${electron.screen.getPrimaryDisplay().size.width}x${electron.screen.getPrimaryDisplay().size.height}`, `-pix_fmt`, `yuv420p`, `-y`, save_path]
            }

            //调用子进程
            const execProcess = spawn(`${pathToFfmpeg}`, execArgs, {
                encoding: 'utf8',
                windowsHide: true,
                detached: true
            });

            execProcess.stdout.on('data', stdout => {
                // console.log('录制打印stdout：' + stdout);
            });

            execProcess.stderr.on('data', stderr => {
                // console.log('录制打印stderr：' + stderr);
            })

            execProcess.on("error", error => {
                console.log('录制打印error：' + error);
            })

            execProcess.on("close", async code => {
                console.log('录制打印code：' + code);
            })

            setTimeout(() => {
                resolve(execProcess)
            }, 1000)
        } catch (error) {
            reject(error)
        }
    });
};

// old recording
// const start_recording = (project_name) => {
//     return new Promise((resolve, reject) => {
//         const save_path = path.normalize(`${os.homedir()}/.uiauto/screenrecorder/${project_name}`);
//         console.log(save_path)

//         let options = {
//             mode: 'text',
//             pythonPath: path.join(path.resolve() + `/env/python/${os.platform()}/${os.platform() === 'win32' ? 'python.exe' : 'bin/python3'}`),
//             // pythonOptions: ["-u"],
//             args: [save_path]
//         };

//         const ls = new PythonShell(path.normalize(`${path.resolve()}/public/base_integration/uiauto_executor/base/screenrecorder/index.py`), options);

//         ls.stdout.on('data', (data) => {
//             console.log("stdout>>>>>>>>>>>>>", data);
//         });

//         ls.stderr.on('data', (data) => {
//             console.log("stderr>>>>>>>>>>>>>", data);
//         });

//         setTimeout(() => {
//             resolve(ls)
//         }, 1000)
//     });

// };

exports.execute = async (project_name, params, options) => {
    return new Promise(async (resolve, reject) => {
        const executor_params = {};
        executor_params["log_file"] = path.normalize(`${os.homedir()}/.uiauto/${project_name}/${moment().format("YYYYMMDD_HHmmss_SSS")}.log`)
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

            const project = fse.readJsonSync(`${params.projectsPath == 'store' ? config.storePath : config.projectsPath}/${project_name}/${project_name}.json`);
            console.log(project);

            if (!!project.automatic_recording && !!project.record_file_path) {
                record_shell = await start_recording(project)
            }

            let client_dir = path.resolve(),
                executor_dir = path.normalize(`${path.resolve()}/public/base_integration/uiauto_executor`),
                sys_site_packages_dir = "",
                user_site_packages_dir = "";
            if (os.platform() === 'win32') {
                sys_site_packages_dir = path.normalize(path.join(path.resolve(), '/env/python/win32/Lib/site-packages'))
                user_site_packages_dir = path.normalize(path.join(path.resolve(), '\\.uiauto\\site-packages'))
            } else if (os.platform() === 'linux') {
                sys_site_packages_dir = path.normalize(path.join(path.resolve(), '/env/python/linux/Lib/site-packages'))
                user_site_packages_dir = path.normalize(path.join(path.resolve(), '/.local/lib/python3.8/site-packages'))
            } else if (os.platform() === 'darwin') {
                if (path.resolve() == "/") {
                    client_dir = path.resolve(path.normalize(electron.app.getPath("exe") + '../../../'));
                    executor_dir = `${path.resolve(path.normalize(electron.app.getPath("exe") + '../../../'))}/public/base_integration/uiauto_executor`;
                    sys_site_packages_dir = path.normalize(path.join(path.resolve(path.normalize(electron.app.getPath("exe") + '../../../')), '/env/python/darwin/lib/python3.8/site-packages'))
                } else {
                    sys_site_packages_dir = path.normalize(path.join(path.resolve(), '/env/python/darwin/lib/python3.8/site-packages'))
                }
            }

            executor_params['project_name'] = project_name;
            executor_params['params'] = params;
            executor_params['environment_options'] = {
                "client_dir": client_dir,
                "plugins_dir": config.pluginsPath,
                "projects_dir": params.projectsPath == 'store' ? config.storePath : config.projectsPath,
                "executor_dir": executor_dir,
                "sys_site_packages_dir": sys_site_packages_dir,
                "user_site_packages_dir": user_site_packages_dir,
                "log_file": path.normalize(`${os.homedir()}/.uiauto/${project_name}/${moment().format("YYYYMMDD_HHmmss_SSS")}.log`),
                "screen_information": screenInfo,
                "server_url": config.serverUrl,
                "device_id": config.deviceId,
                "access_token": localStorage.getItem('access_token')
            };

            options.taskId = params.uiauto_task_id
            listen_logger(path.normalize(`${os.homedir()}/.uiauto/${project_name}`),
                executor_params['environment_options']['log_file'], options);

            const result = await send_command('execute_project', project_name, executor_params);
            if (record_shell) {
                // 退出录制
                record_shell.stdin.setEncoding('utf8');
                record_shell.stdin.write('q');
            }
            resolve(result);

        } catch (e) {
            if (record_shell) {
                // 退出录制
                record_shell.stdin.setEncoding('utf8');
                record_shell.stdin.write('q');
            }
            reject(e);
        }

        console.log("移除日志文件监听")
        if (record_shell) {
            // 退出录制
            record_shell.stdin.setEncoding('utf8');
            record_shell.stdin.write('q');
        }
        fs.unwatchFile(executor_params["log_file"]);
        _.forEach(openFileStore, (fid) => {
            fs.closeSync(fid);
            openFileStore.pop(fid)
        })
    });

};

exports.execute_node = (project_name, params, newCB) => {
    return new Promise(async (resolve, reject) => {
        const executor_params = {};
        executor_params["log_file"] = path.normalize(`${os.homedir()}/.uiauto/${project_name}/${moment().format("YYYYMMDD_HHmmss_SSS")}.log`)

        try {
            console.log("execute_node>>>>>>>>", project_name);
            let client_dir = path.resolve(),
                executor_dir = path.normalize(`${path.resolve()}/public/base_integration/uiauto_executor`),
                sys_site_packages_dir = "",
                user_site_packages_dir = "";
            if (os.platform() === 'win32') {
                sys_site_packages_dir = path.normalize(path.join(path.resolve(), '/env/python/win32/Lib/site-packages'))
                user_site_packages_dir = path.normalize(path.join(path.resolve(), '\\.uiauto\\site-packages'))
            } else if (os.platform() === 'linux') {
                sys_site_packages_dir = path.normalize(path.join(path.resolve(), '/env/python/linux/Lib/site-packages'))
                user_site_packages_dir = path.normalize(path.join(path.resolve(), '/.local/lib/python3.8/site-packages'))
            } else if (os.platform() === 'darwin') {
                if (path.resolve() == "/") {
                    client_dir = path.resolve(path.normalize(electron.app.getPath("exe") + '../../../'));
                    executor_dir = `${path.resolve(path.normalize(electron.app.getPath("exe") + '../../../'))}/public/base_integration/uiauto_executor`;
                    sys_site_packages_dir = path.normalize(path.join(path.resolve(path.normalize(electron.app.getPath("exe") + '../../../')), '/env/python/darwin/lib/python3.8/site-packages'));
                } else {
                    sys_site_packages_dir = path.normalize(path.join(path.resolve(), '/env/python/darwin/lib/python3.8/site-packages'))
                }
            }

            executor_params['project_name'] = project_name;
            executor_params['params'] = params;
            executor_params['environment_options'] = {
                "client_dir": client_dir,
                "plugins_dir": config.pluginsPath,
                "projects_dir": params.projectsPath == 'store' ? config.storePath : config.projectsPath,
                "log_file": path.normalize(`${os.homedir()}/.uiauto/${project_name}/${moment().format("YYYYMMDD_HHmmss_SSS")}.log`),
                "executor_dir": executor_dir,
                "sys_site_packages_dir": sys_site_packages_dir,
                "user_site_packages_dir": user_site_packages_dir,
            };

            listen_logger(path.normalize(`${os.homedir()}/.uiauto/${project_name}`), executor_params['environment_options']['log_file'], newCB);

            const result = await send_command('execute_node', project_name, executor_params);
            resolve(result)
        } catch (e) {
            reject(e);
            listener.removeAllListeners();
        }

        fs.unwatchFile(executor_params["log_file"])
        _.forEach(openFileStore, (fid) => {
            fs.closeSync(fid);
            openFileStore.pop(fid)
        })
    });
};

const send_command = (command, project_name, executor_params) => {
    return new Promise((resolve, reject) => {
        try {
            let temp_dir;
            if (os.platform() == 'darwin' && path.resolve() == "/") {
                temp_dir = path.normalize(`${electron.app.getPath("exe") + '../../../'}.uiauto/temp/`);
            } else {
                temp_dir = path.normalize(`${path.resolve()}/.uiauto/temp/`);
            }
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
            let client_dir = path.resolve(),
                executor_dir = path.normalize(`${path.resolve()}/public/base_integration/uiauto_executor`),
                sys_site_packages_dir = "",
                user_site_packages_dir = "";
            if (os.platform() === 'win32') {
                sys_site_packages_dir = path.normalize(path.join(path.resolve(), '/env/python/win32/Lib/site-packages'))
                user_site_packages_dir = path.normalize(path.join(path.resolve(), '\\.uiauto\\site-packages'))
            } else if (os.platform() === 'linux') {
                sys_site_packages_dir = path.normalize(path.join(path.resolve(), '/env/python/linux/Lib/site-packages'))
                user_site_packages_dir = path.normalize(path.join(path.resolve(), '/.local/lib/python3.8/site-packages'))
            } else if (os.platform() === 'darwin') {
                if (path.resolve() == "/") {
                    client_dir = path.resolve(path.normalize(electron.app.getPath("exe") + '../../../'));
                    executor_dir = `${path.resolve(path.normalize(electron.app.getPath("exe") + '../../../'))}/public/base_integration/uiauto_executor`;
                    sys_site_packages_dir = path.normalize(path.join(path.resolve(path.normalize(electron.app.getPath("exe") + '../../../')), '/env/python/darwin/lib/python3.8/site-packages'));
                } else {
                    sys_site_packages_dir = path.normalize(path.join(path.resolve(), '/env/python/darwin/lib/python3.8/site-packages'))
                }
            }
            const py_info = path.parse(py_path);
            const executor_params = {};
            executor_params['client_dir'] = client_dir;
            executor_params['py_dir'] = py_info.dir;
            executor_params['py_name'] = py_info.name;
            executor_params['py_path'] = py_path;
            executor_params['method'] = method;
            executor_params["executor_dir"] = executor_dir
            executor_params["sys_site_packages_dir"] = sys_site_packages_dir
            executor_params["user_site_packages_dir"] = user_site_packages_dir
            executor_params['params'] = params;
            executor_params['environment_options'] = {
                "client_dir": client_dir,
                "py_dir": py_info.dir,
                "py_name": py_info.name,
                "py_path": py_path,
                "method": method,
                "executor_dir": executor_dir,
                "sys_site_packages_dir": sys_site_packages_dir
            };

            let temp_dir;
            if (os.platform() == 'darwin' && path.resolve() == "/") {
                temp_dir = path.normalize(`${electron.app.getPath("exe") + '../../../'}.uiauto/temp/`);
            } else {
                temp_dir = path.normalize(`${path.resolve()}/.uiauto/temp/`);
            }

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
        exit_executor()
    }

    let pythonPath = ""
    if (os.platform() === 'win32') {
        pythonPath = path.normalize(path.join(path.resolve() + `/env/python/${os.platform()}/python.exe`))
    } else if (os.platform() === 'linux') {
        pythonPath = path.normalize(path.join(path.resolve() + `/env/python/${os.platform()}/python`))
    } else if (os.platform() === 'darwin') {
        if (path.resolve() == "/") {
            pythonPath = path.normalize(`${electron.app.getPath("exe") + '../../../'}env/python/darwin/bin/python3`)
        } else {
            pythonPath = path.normalize(path.join(path.resolve() + `/env/python/${os.platform()}/bin/python3`))
        }
    }


    let options = {
        mode: 'text',
        pythonPath: pythonPath,
        // pythonOptions: ["-u"],
        args: []
    };

    let ls;
    if (os.platform() == 'darwin' && path.resolve() == "/") {
        ls = new PythonShell(path.normalize(`${electron.app.getPath("exe") + '../../../'}public/base_integration/uiauto_executor/command.py`), options);
    } else {
        ls = new PythonShell(path.normalize(path.resolve() + "/public/base_integration/uiauto_executor/command.py"), options);
    }

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

let exit_executor = () => {
    window['py_shell'].terminate()
}
exports.exit_executor = exit_executor;