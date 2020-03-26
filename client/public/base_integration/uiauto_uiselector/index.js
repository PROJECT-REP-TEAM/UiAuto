const fse = require('fs-extra');
const {PythonShell} = require('python-shell');
const path = require('path');
const uuid = require('uuid');
const config = fse.readJsonSync(`${path.resolve()}/.uiauto/uiauto.conf`);
const EventEmitter=require('events').EventEmitter;
const listener = new EventEmitter();
const child_process = require("child_process");

exports.start_process = () => {
    let options = {
        mode: 'text',
        pythonPath: path.join(path.resolve() + "/env/python/win32/python.exe"),
        // pythonOptions: ["-u"],
        args: []
    };

    window['uiselector_py_shell'] = new PythonShell(path.normalize(path.resolve() + "\\public\\base_integration\\uiauto_uiselector\\command.py"), options);

    window['uiselector_py_shell'].stdout.on('data', (data) => {
        console.log('uiselector stdout data >>>>>>>>>>', data);
        listener.emit("success", data);
    });

    window['uiselector_py_shell'].stderr.on('data', (data) => {
        console.log('uiselector stderr data >>>>>>>>>>', data);
        listener.emit("error", data);
    });

    return window['uiselector_py_shell'];
};

exports.execute = (params) => {
    return new Promise((resolve, reject) => {
        try {
            const temp_dir = path.normalize(`${path.resolve()}\\.uiauto\\temp\\`);
            if (!fs.existsSync(temp_dir)) {
                fs.mkdirSync(temp_dir);
            }
            let param_file_name = "uiselector_params.txt";
            let param_file_path = temp_dir + param_file_name;
            fs.writeFileSync(param_file_path, JSON.stringify(params));

            listener.on("success", (data) => {
                let result_file_path = param_file_path.replace('.txt', '_result.txt');
                let result = JSON.parse(fs.readFileSync(result_file_path));
                if (result) {
                    resolve(result);
                } else {
                    reject('没有选择到元素');
                }
                listener.removeAllListeners()
            });

            listener.on("error", (data) => {
                reject(data);
                listener.removeAllListeners()
            });

            if (window['uiselector_py_shell']) {
                window['uiselector_py_shell'].send('execute ' + param_file_path);
            } else {
                reject('选择器没有启动')
            }
        } catch (e) {
            reject(e)
        }

    });

};

exports.remote_browser = (params) => {
    const temp_dir = path.normalize(`${path.resolve()}\\.uiauto\\temp\\`);
    if (!fs.existsSync(temp_dir)) {
        fs.mkdirSync(temp_dir);
    }
    let param_file_name = "uiselector_params.txt";
    let param_file_path = temp_dir + param_file_name;
    fs.writeFileSync(param_file_path, JSON.stringify(params));
    if (window['uiselector_py_shell']) {
        window['uiselector_py_shell'].send('remote_browser ' + param_file_path);
    } else {
        console.error('选择器没有启动')
    }
}

exports.open_browser = (params) => {
    return new Promise((resolve, reject) => {
        try {

            const shell_result = child_process.execSync("REG QUERY HKEY_CURRENT_USER\\SOFTWARE\\Google\\Chrome\\BLBeacon /v version");
            console.log("shell>>>>>>>>>>>>>>>>>", shell_result.toString().split("    "));

            const temp_dir = path.normalize(`${path.resolve()}\\.uiauto\\temp\\`);
            if (!fs.existsSync(temp_dir)) {
                fs.mkdirSync(temp_dir);
            }
            let param_file_name = "uiselector_params.txt";
            let param_file_path = temp_dir + param_file_name;
            params['client_dir'] = path.normalize(path.resolve());
            fs.writeFileSync(param_file_path, JSON.stringify(params));
        
            listener.on("success", (data) => {
                let result_file_path = param_file_path.replace('.txt', '_result.txt');
                let result = JSON.parse(fs.readFileSync(result_file_path));
                if (result) {
                    resolve(result);
                } else {
                    reject('启动浏览器失败');
                }
                listener.removeAllListeners()
            });
        
            listener.on("error", (data) => {
                reject(data);
                listener.removeAllListeners()
            });
        
            if (window['uiselector_py_shell']) {
                window['uiselector_py_shell'].send('open_browser ' + param_file_path);
            } else {
                reject('选择器没有启动')
            }
        } catch (e) {
            reject(e)
        }
    });
}

exports.restart_process = () => {
    console.log("重启UI选择器");
    window['uiselector_py_shell'].terminate();
    exports.start_process();
};

exports.exit_uiselector = () => {
    window['uiselector_py_shell'].send('exit');
};

