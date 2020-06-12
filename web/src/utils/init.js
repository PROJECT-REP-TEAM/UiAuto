/*
 * @Author: chenzy
 * @LastEditors: chenzy
 * @Date: 2019-08-17 17:24:29
 * @LastEditTime: 2019-08-20 09:21:51
 * @Description: file content
 */
const {
    exec,
    spawn
} = window.require('child_process');
const fse = window.require("fs-extra");
const fs = window.require("fs");
const path = window.require("path");
const npm = window.require("npm");
const os = window.require("os");

export function nodeInit(filePath) {
    return new Promise((reslove, reject) => {
        console.log(filePath);

        npm.load({}, (err) => {
            if (err) {
                reject(err);
                return false;
            }

            npm.commands.install(filePath, [], (error, dependencies) => {
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

        /*exec('npm install', {
            cwd: filePath
        }, (err, stdout, stderr) => {
            console.log("install");
            console.log(err);
            console.log(stdout);
            console.log(stderr);
            if (err != null) {
                reject(err)
            } else {
                exec('npm ls --depth 0', {
                    cwd: filePath
                }, (err, stdout, stderr) => {
                    console.log("install");
                    console.log(err);
                    console.log(stdout);
                    console.log(stderr);
                    if (err != null) {
                        reject(err)
                    } else {
                        stdout += "";
                        console.log(stdout);
                        // data = data.replace(/[\r\n├└──`+-]/g, "");
                        stdout = stdout.replace(/[\r\n├└──`+]/g, "");
                        stdout = stdout.replace(/(--)/, "");
                        stdout = stdout.replace(/^[^\s]+\s+/, "");
                        stdout = stdout.replace(/^[^\s]+\s+/, "");
                        console.log(stdout);
                        var haveDepandenciesResult = stdout.split(" ");
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
                        console.log(depandency_hiatus)
                        if (depandency_hiatus.length > 0) {
                            reject("err");
                        } else {
                            // packageResult.source = "web";
                            // fse.writeJsonSync(filePath, packageResult);
                            reslove("success")
                        }
                    }

                })
                // var checkDependencies = spawn("npm", ["ls", "--depth", "0"], {
                //     cwd: filePath
                // });
                // checkDependencies.stdout.on("data", data => {

                // });
            }
        })*/
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

                exec(pythonPath + ' -m pip install -r requirements.txt --user --no-warn-script-location', {
                    cwd: filePath
                }, (err, stdout, stderr) => {
                    if (err != null) {
                        reject(err);
                    } else {
                        if (stderr && stderr.indexOf("You should consider upgrading via the 'python -m pip install --upgrade pip' command") === -1) {
                            reject(stderr);
                            return false;
                        }
                        reslove("Success");

                        /*exec(pythonPath + ' -m pip list', {
                            cwd: filePath
                        }, (err, stdout, stderr) => {
                            if (err != null) {
                                reject(err)
                            } else {
                                var haveDepandencies = [];
                                var needDepandencies = [];
                                var needDepandenciesResult = fs.readFileSync(filePath + '/requirements.txt', 'utf8');
                                stdout = stdout.split("---------- -------")[1];
                                stdout = stdout.replace(/[\r\n]/g, ",");
                                stdout = stdout.replace(/(^\,*)|(\,*$)/g, "");
                                stdout = stdout.replace(/\s+/g, ' ');
                                var haveDepandenciesResult = _.compact(stdout.split(','));
                                _.each(haveDepandenciesResult, string => {
                                    var haveDepandency = string.split(" ");
                                    if (haveDepandency[1] != '' && haveDepandency[1] != undefined) {
                                        haveDepandencies.push({[haveDepandency[0]]: haveDepandency[1]})
                                    }
                                });

                                // operate data
                                _.each(_.compact(needDepandenciesResult.replace(/[\r]*!/g, '').split('\n')), string => {
                                    if (string.search(">=") != -1) {
                                        string = string.split(">=");
                                    } else {
                                        string = string.split("==");
                                    }
                                    var needDepandency = string;
                                    needDepandencies.push({[needDepandency[0]]: needDepandency[1]})
                                });

                                // result
                                console.log(needDepandencies)
                                var depandency_hiatus = _.differenceWith(needDepandencies, haveDepandencies, _.isEqual);
                                console.log(depandency_hiatus)
                                if (depandency_hiatus.length > 0) {
                                    reject("err");
                                } else {
                                    // var packageResult = fse.readJsonSync(filePath + "/package.json")
                                    // packageResult.source = "web";
                                    // fse.writeJsonSync(filePath, packageResult);
                                    reslove("Success")
                                }

                            }

                        })*/
                    }

                    lineContents[85] = 'USER_SITE = None';
                    fs.writeFileSync(sitePyPath, lineContents.join('\n'));
                })
            } else {
                reject("系统找不到python版本");
            }

        } else {
            reject("系统找不到依赖文件");
        }
    })
}
