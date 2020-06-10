const fse = require('fs-extra');
const {PythonShell} = require('python-shell');
const path = require('path');
const uuid = require('uuid');
const os = require('os')
const config = fse.readJsonSync(`${os.homedir()}/.uiauto/uiauto.conf`);
const EventEmitter=require('events').EventEmitter;
const listener = new EventEmitter();
const child_process = require("child_process");

exports.start_process = () => {
    console.log(__dirname + "\\UiSelector.exe");
    if (window.hasOwnProperty("uiselector_shell")) {
        window['uiselector_shell'] = null;
    }
    window['uiselector_shell'] = child_process.execFile(path.resolve(__dirname + "\\UiSelector.exe"), (err, stdout, stderr) => {
        console.log(err, stdout, stderr);
    });

    window['uiselector_shell'].stdout.on("data", (data) => {
        console.log('uiselector stdout data >>>>>>>>>>', data);
        const result_file_path = path.join(path.resolve(), "\\public\\base_integration\\uiauto_uiselector\\result.json");
        if (fs.existsSync(result_file_path)) {
            const result = fse.readJSONSync(result_file_path);
            console.log("uiselector selected result", result);
            listener.emit("success", result);
            fs.unlinkSync(result_file_path);
        } else {
            if (data.indexOf("<uiauto-uiselector>cancel</uiauto-uiselector>") > -1) {
                listener.emit("success", null);
            }
        }
    });

    window['uiselector_shell'].stderr.on("data", (data) => {
        console.log('uiselector stderr data >>>>>>>>>>', data);
        listener.emit("error", data);
    });

    // console.log(child);
    // child.stdin.write("start\n");
};

exports.execute = (params) => {
    return new Promise((resolve, reject) => {
        try {

            listener.on("success", (data) => {
                resolve(data);
                listener.removeAllListeners()
            }); 

            listener.on("error", (data) => {
                reject(data);
                listener.removeAllListeners()
            });

            if (window['uiselector_shell']) {
                window['uiselector_shell'].stdin.write("start\n");
            } else {
                reject('选择器没有启动')
            }
        } catch (e) {
            reject(e)
        }

    });

};

exports.open_browser = (params) => {
    return new Promise((resolve, reject) => {
        try {

            const shell_result = child_process.execSync("REG QUERY HKEY_CURRENT_USER\\SOFTWARE\\Google\\Chrome\\BLBeacon /v version");
            console.log("shell>>>>>>>>>>>>>>>>>", shell_result.toString().split("    "));
        
            listener.on("success", (data) => {
                resolve(data);
                listener.removeAllListeners()
            });
        
            listener.on("error", (data) => {
                reject(data);
                listener.removeAllListeners()
            });
        
            if (window['uiselector_shell']) {
                window['uiselector_shell'].stdin.write('open_chrome\n');
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
    window['uiselector_shell'].stdin.write("exit_app\n");
    setTimeout(() => {
        window['uiselector_shell'].kill();
        exports.start_process();
    }, 500)
    
    
};

exports.exit_uiselector = () => {
    window['uiselector_shell'].stdin.write("close_chrome\n");
    window['uiselector_shell'].kill();
};

