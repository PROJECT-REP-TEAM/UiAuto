const { PythonShell } = window.require("python-shell");
const _ = require('lodash');
const uuid = window.require('uuid');
const fs = window.require('fs');
const path = window.require('path');

exports.execute_python = (py_path, params, opt) => {
  const promise = new Promise((resolve, reject) => {
    console.log("execute_python>>>>>>>>>>>", py_path, params, opt);

    try {

      const script_path = path.parse(py_path);
      const temp_dir = path.resolve() + "\\temp\\";
      const param_file_name = script_path.name + "_" + uuid.v4() + ".txt";
      const param_file_path = temp_dir + param_file_name;
      fs.writeFileSync(param_file_path, JSON.stringify(params));

      const args = {
        param_file_path: param_file_path,
        script_path: script_path,
        is_program: opt && opt['is_program'] ? opt['is_program'] : false,
        is_keep_running: opt && opt['is_keep_running'] ? opt['is_keep_running'] : false
      };

      let options = {
        mode: 'text',
        pythonPath: "C:\\venv\\ui-auto\\Scripts\\python.exe",
        pythonOptions: ["-u"],
        args: [JSON.stringify(args)]
      };

      const pyShell = new PythonShell(path.resolve() + "\\..\\public\\pyscript\\executor\\executor.py", options);

      pyShell.stdout.on("data", (data) => {
        console.log("stdout data >>>>>>>>", data);
        if (args.is_keep_running) {
          const result_file = param_file_path.replace(".txt", "_result.txt");
          if (fs.existsSync(result_file)) {
            const result = fs.readFileSync(result_file);
            resolve(JSON.parse(result.toString()));
  
            fs.unlinkSync(param_file_path);
            fs.unlinkSync(result_file);
          } else {
            reject("python 脚本执行结果文件不存在");
          }
        }
      });

      pyShell.stderr.on("data", (data) => {
        console.error("stderr data >>>>>>", data)
        reject(data)
      })

      pyShell.on("error", (error) => {
        console.log("pyutill execute_python error:", error);
        reject(error);
      });

      pyShell.end((code, signal, finished) => {
        console.log("end>>>>>>>>>", code, signal, finished);
        if (!args.is_keep_running) {
          const result_file = param_file_path.replace(".txt", "_result.txt");
          if (fs.existsSync(result_file)) {
            const result = fs.readFileSync(result_file);
            resolve(JSON.parse(result.toString()));

            fs.unlinkSync(param_file_path);
            fs.unlinkSync(result_file);
          } else {
            reject("python 脚本执行结果文件不存在");
          }
        }
      });

    } catch (e) {
      console.error(e);
      reject(e);
    }

  });

  return promise;
};
