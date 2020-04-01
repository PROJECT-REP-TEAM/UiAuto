let PythonShell;
let _;
let uuid;
let path;
let iconv;
let config;
let os;
let child_process;
if (typeof window !== "undefined") {
    PythonShell = window.require("python-shell").PythonShell;
    _ = window.require('lodash');
    uuid = window.require('uuid');
    fs = window.require('fs');
    os = window.require("os");
    path = window.require('path');
    iconv = window.require('iconv-lite');
    fse = window.require("fs-extra");
    config = fse.readJsonSync(`${os.homedir()}/.uiauto/uiauto.conf`);
    window.require(path.resolve() + "/public/utils/ConsoleUtils").init();
    child_process = window.require('child_process');
} else {
    PythonShell = require("python-shell").PythonShell;
    _ = require('lodash');
    uuid = require('uuid');
    fs = require('fs');
    os = require("os");
    path = require('path');
    iconv = require('iconv-lite');
    fse = require("fs-extra");
    config = fse.readJsonSync(`${os.homedir()}/.uiauto/uiauto.conf`);
    require("./ConsoleUtils").init();
    child_process = require('child_process');
    require(path.resolve() + "/public/utils/ConsoleUtils").init();
}

exports.execute_python = (py_path, params, opt) => {
    const promise = new Promise((resolve, reject) => {
        console.log("execute_python>>>>>>>>>>>", py_path, params, opt);

        try {

            const script_path = path.parse(py_path);

            params['uiauto_config'] = {
                client_dir: path.resolve()
            };
            const args = {
                script_path: script_path,
                params: params,
                environment_options: {
                    client_dir: path.resolve()
                }
            };

            const environment_options = {
                client_dir: path.resolve()
            };

            const temp_dir = path.normalize(`${path.resolve()}\\.uiauto\\temp\\`);
            if (!fs.existsSync(temp_dir)) {
                fs.mkdirSync(temp_dir);
            }
            const param_file_name = script_path.name + "_" + uuid.v4() + ".txt";
            const param_file_path = temp_dir + param_file_name;
            fs.writeFileSync(param_file_path, JSON.stringify(args));

            let options = {
                mode: 'text',
                pythonPath: path.join(path.resolve() + "/env/python/win32/python.exe"),
                args: [param_file_path]
            };


            console.log("exec>>>>>>>>>>>>>>>111111");
            /*const shell = child_process.spawn(path.join(path.resolve(), "\\env\\python\\win32\\python.exe"), [
                "-u",
                path.normalize(path.resolve() + "\\public\\pyscript\\executor\\executor.py"),
                param_file_path
            ], {
                shell: true
            });

            shell.stdout.on('data', (data) => {
                console.log(`python execute log: ${data.toString()}`);

                const result_file = param_file_path.replace(".txt", "_result.txt");
                fs.unlinkSync(param_file_path);
                if (fs.existsSync(result_file)) {
                    const result = JSON.parse(fs.readFileSync(result_file), 'utf8');
                    if (result.success) {
                        resolve(result);
                    } else {
                        reject(result.msg);
                    }

                    fs.unlinkSync(result_file);
                }
            });

            shell.stderr.on('data', (data) => {
                console.error(`python execute error: ${data.toString()}`);
                reject(data.toString())
            });*/

            const pyShell = new PythonShell(path.normalize(path.resolve() + "\\public\\pyscript\\executor\\executor.py"), options);

            pyShell.stdout.on("data", (data) => {
                console.log("stdout data >>>>>>>>", data);
              const result_file = param_file_path.replace(".txt", "_result.txt");
              fs.existsSync(param_file_path) && fs.unlinkSync(param_file_path);
              if (fs.existsSync(result_file)) {
                const result = JSON.parse(fs.readFileSync(result_file), 'utf8');
                if (result.success) {
                  resolve(result);
                } else {
                  reject(result.msg);
                }

                fs.existsSync(result_file) && fs.unlinkSync(result_file);
              }
            });

            pyShell.stderr.on("data", (data) => {
              console.error("stderr data >>>>>>", data);
              reject(data)
            });

            pyShell.on("error", (error) => {
              console.log("pyutill execute_python error:", error);
              fs.writeFileSync(param_file_path.replace(".txt", "_result.txt"), error);
              reject(error);
            });

            pyShell.end((code, signal, finished) => {
              console.log("end>>>>>>>>>", code, signal, finished);
            });

        } catch (e) {
            console.error(e);
            reject(e);
        }

    });

    return promise;
};
