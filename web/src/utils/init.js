/*
 * @Author: chenzy
 * @LastEditors: chenzy
 * @Date: 2019-08-17 17:24:29
 * @LastEditTime: 2019-08-20 09:21:51
 * @Description: file content
 */
const {
    exec,
    spawn,
    execSync
} = window.require('child_process');
const fse = window.require("fs-extra");
const fs = window.require("fs");
const path = window.require("path");
const npm = window.require("npm");
const os = window.require("os");
const configPath = `${os.homedir()}/.uiauto/uiauto.conf`;
var URL = window.require('url');
const _ = require("lodash");

export function nodeInit(filePath) {
    return new Promise((reslove, reject) => {
        console.log(filePath);

        npm.load({}, (err) => {
            if (err) {
                reject(err);
                return false;
            }

            const uiauto_config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            const npmSource = _.find(uiauto_config.npmSource, {is_default: true});

            // if (!!npmSource) {
            //   console.log(npmSource);

            //   // 切换npm源
            //   npm.config.set('registry', npmSource.url);
            //   console.log("切换npm源：" + npm.config.get('registry'));
            // }

            // 设置缓存文件夹
            npm.config.set('cache', path.join(filePath, "packages"))
            console.log("当前缓存文件夹：", npm.config.get("cache"))

            npm.commands.install(filePath, [],  (error, dependencies) => {
                console.log('npm install');
                console.log(error, dependencies);
                if (error) {
                    reject(err);
                    return false;
                }

                const haveDepandenciesResult = [];
                _.forEach(dependencies, (dependency) => {
                    haveDepandenciesResult.push(dependency[0]);
                });

                var haveDepandencies = []
                var needDepandencies = []
                _.each(haveDepandenciesResult, function (item, idx) {
                    const dep_key = item.substring(0, item.lastIndexOf('@'));
                    // const dep_value = item.substring(item.lastIndexOf('@') + 1);
                    // var the_depandency = { [dep_key]: dep_value }
                    // haveDepandencies.push(the_depandency)
                    haveDepandencies.push(dep_key)
                })
                console.log(haveDepandencies);
                var packageResult = fse.readJsonSync(filePath + "/package.json")
                _.map(packageResult.dependencies, function (value, key) {
                    // value = value.replace(/[\^/]/, "");
                    // const needDepandency = { [key]: value }
                    // needDepandencies.push(needDepandency)
                    needDepandencies.push(key)
                });
                console.log(needDepandencies);

                var depandency_hiatus = _.differenceWith(needDepandencies, haveDepandencies, _.isEqual);
                console.log(depandency_hiatus);
                if (depandency_hiatus.length > 0) {
                    reject("err");
                } else {
                    // packageResult.source = "web";
                    // fse.writeJsonSync(filePath, packageResult);
                    reslove("success")
                }
            })
        });

    })
}

export function pythonInit(filePath, plugin_version) {
    return new Promise((reslove, reject) => {
        console.log("filePath", plugin_version);
        console.log(filePath, fs.existsSync(filePath + '/requirements.txt'));
        if (fs.existsSync(filePath + '/requirements.txt')) {
            if (!!plugin_version) {
                console.log("pip install")
                const sitePyPath = path.join(path.resolve(), '/env/python/win32/Lib/site.py');
                const rfs = fs.readFileSync(path.join(path.resolve(), '/env/python/win32/Lib/site.py'));
                let content = rfs.toString();
                const lineContents = content.split('\n');
                console.log(lineContents[85]);
                lineContents[85] = 'USER_SITE = "' + path.resolve(`${os.homedir()}/.uiauto/site-packages/${path.basename(filePath)}/${plugin_version}`).replace(/\\/g, "\\\\") + '"';
                fs.writeFileSync(sitePyPath, lineContents.join('\n'));

                const pythonPath = path.join(path.resolve(), '/env/python/win32/python.exe');

                // const uiauto_config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                // const pipSource = _.find(uiauto_config.pipSource, {is_default: true});
                // let pip_url = "";
                // let pip_host = "";
                // if (!!pipSource) {
                //   console.log(pipSource)
                //   const urlObj = URL.parse(pipSource.url, true);
                //   pip_url = " -i " + pipSource.url;
                //   pip_host = " --trusted-host=" + urlObj.hostname;
                // }

                const packages_dir = path.join(filePath, "packages");
                if (fs.existsSync(packages_dir)) {
                    let packages_files = fs.readdirSync(packages_dir);
                    console.log(packages_files);
                    if (!!packages_files && packages_files.length > 0) {
                        packages_files = _.filter(packages_files, (item) => {
                            return !fs.lstatSync(path.join(packages_dir, item)).isDirectory() && path.extname(item) === ".whl";
                        });

                        _.forEach(packages_files, (file) => {
                            const whl = path.join(packages_dir, file);
                            try {
                                const log = execSync(pythonPath + " -m pip install " + whl + " --user --no-warn-script-location", {
                                    cwd: filePath
                                });
                                console.log("python依赖库 " + file + " 安装完成：", log.toString());
                            } catch (e) {
                                console.log("python依赖库 " + file + " 安装出错：", e);
                            }
                        })
                    }

                    lineContents[85] = 'USER_SITE = None';
                    fs.writeFileSync(sitePyPath, lineContents.join('\n'));
                }

                reslove("Success");


                // exec(pythonPath + ' -m pip install -r requirements.txt --user --no-warn-script-location' + pip_url + pip_host, {
                //     cwd: filePath
                // }, (err, stdout, stderr) => {
                //     if (err != null) {
                //         reject(err);
                //     } else {
                //         if (stderr && stderr.indexOf("You should consider upgrading via the 'python -m pip install --upgrade pip' command") === -1) {
                //             reject(stderr);
                //             return false;
                //         }
                //         reslove("Success");
                //     }

                //     lineContents[85] = 'USER_SITE = None';
                //     fs.writeFileSync(sitePyPath, lineContents.join('\n'));
                // })
            } else {
                reject("系统找不到python版本");
            }

        } else {
            reject("系统找不到依赖文件");
        }
    })
}
