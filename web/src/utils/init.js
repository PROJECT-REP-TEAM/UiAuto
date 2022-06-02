/*
 * @Author: chenzy
 * @LastEditors: guanhaimin
 * @Date: 2019-08-17 17:24:29
 * @LastEditTime: 2020-11-10 10:46:05
 * @Description: file content
 */
const {
  exec,
  spawn,
  execSync
} = window.nodeRequire('child_process')
const fse = window.nodeRequire('fs-extra')
const fs = window.nodeRequire('fs')
const path = window.nodeRequire('path')
const npminstall = window.nodeRequire('npminstall');
const os = window.nodeRequire('os')
const configPath = `${os.homedir()}/.uiauto/uiauto.conf`
var URL = window.nodeRequire('url')
const _ = require('lodash')
const { app } = window.nodeRequire('@electron/remote');

export function nodeInit(filePath) {
  return new Promise((resolve, reject) => {

    console.log('------开始安装nodejs依赖--------')

    console.log(filePath)
    // console.log(targetPath)
    // console.log(path.normalize(`${targetPath}/node_modules`))

    npminstall({
      // install root dir
      root: filePath,
      // optional packages need to install, default is package.json's dependencies and devDependencies
      // pkgs: [
      //   { name: 'foo', version: '~1.0.0' },
      // ],
      // install to specific directory, default to root
      // targetDir: '/home/admin/.global/lib',
      // link bin to specific directory (for global install)
      // binDir: '/home/admin/.global/bin',
      // registry, default is https://registry.npmjs.org
      registry: 'https://registry.npmmirror.com/',
      // debug: false,
      // storeDir: path.normalize(`${targetPath}/node_modules`),
      // ignoreScripts: true, // ignore pre/post install scripts, default is `false`
      // forbiddenLicenses: forbit install packagÏÏes which used these licenses
    }).then(function (result) {
      console.log('------安装依赖完成--------')
      // console.log(result);
      resolve("success")
    }).catch(err => {
      console.error('-------安装依赖出错----');
      console.error(err);
      reject(err)
    });

  })
}

// node  packages.json生成缓存文件
export function nodeGenerateCache(path) {
  return new Promise((resolve, reject) => {
    exec(`npm install --cache packages`, {
      cwd: path,
      windowsHide: true
    }, (error, stdout, stderr) => {
      fs.unlinkSync(`${path}/package-lock.json`)
      deleteFolder(`${path}/node_modules`)
      resolve('success')
    })
  })
}

// 清空文件夹
var deleteFolder = function (path) {
  var files = []
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path)
    files.forEach(function (file, index) {
      var curPath = `${path}/${file}`
      if (fs.statSync(curPath).isDirectory()) { // recurse
        deleteFolder(curPath)
      } else { // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}

export function pythonInit(filePath, plugin_version) {
  return new Promise(async (resolve, reject) => {
    // console.log('filePath', plugin_version)
    // console.log(filePath, fs.existsSync(filePath + '/requirements.txt'))
    if (fs.existsSync(filePath + '/requirements.txt')) {
      if (plugin_version) {
        console.log('pip install')
        var sitePyPath = ""
        let lineContents = null
        if (os.platform() === 'win32') {
          const rfs = fs.readFileSync(path.join(path.resolve(), '/env/python/win32/Lib/site.py'))
          const content = rfs.toString()
          sitePyPath = path.join(path.resolve(), '/env/python/win32/Lib/site.py')
          lineContents = content.split('\n')
          console.log(lineContents[85])
          lineContents[85] = 'USER_SITE = "' + path.resolve(`${os.homedir()}/.uiauto/site-packages/${path.basename(filePath)}/${plugin_version}`).replace(/\\/g, '\\\\') + '"'
          fs.writeFileSync(sitePyPath, lineContents.join('\n'))
        }

        var pythonPath = ""
        if (os.platform() === 'win32') {
          pythonPath = path.normalize(path.join(path.resolve() + `/env/python/${os.platform()}/python.exe`))
        } else if (os.platform() === 'linux') {
          pythonPath = path.normalize(path.join(path.resolve() + `/env/python/${os.platform()}/python`))
        } else if (os.platform() === 'darwin') {
          if (path.resolve() == '/') {
            pythonPath = path.normalize(app.getPath("exe") + '../../../env/python/darwin/bin/python3')
          } else {
            pythonPath = path.normalize(path.join(path.resolve() + `/env/python/${os.platform()}/bin/python3`))
          }
        }

        console.log("pythonPath：" + pythonPath)

        if (os.platform() === 'linux') {
          try {
            execSync(pythonPath + ' -m ensurepip --upgrade')
          } catch (error) {
            console.log('linux pip error：', error)
            reject(error)
          }
        }
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

        const packages_dir = path.join(filePath, 'packages')
        console.log("packages_dir：" + packages_dir)
        if (fs.existsSync(packages_dir)) {
          const packages_files = fs.readdirSync(packages_dir)
          console.log('开始离线安装python依赖库')
          exec(pythonPath + ` -m pip install -r requirements.txt --no-index --find-links=` + packages_dir, {
            cwd: filePath
          }, (error, stdout, stderr) => {
            if (error) {
              console.log('python依赖库离线安装出错：', error)
              console.log('开始在线安装python依赖库')
              exec(pythonPath + ` -m pip install -r requirements.txt -i http://mirrors.aliyun.com/pypi/simple --trusted-host mirrors.aliyun.com`, {
                cwd: filePath
              }, (error, stdout, stderr) => {
                if (error) {
                  console.log('python依赖库在线安装出错：', error)
                  reject(error)
                } else {
                  resolve('Success')
                }
              })
            } else {
              resolve('Success')
            }
          })
          // console.log(packages_files);
          // if (!!packages_files && packages_files.length > 0) {
          //     packages_files = _.filter(packages_files, (item) => {
          //         return !fs.lstatSync(path.join(packages_dir, item)).isDirectory() && path.extname(item) === ".whl";
          //     });

          //     _.forEach(packages_files, (file) => {
          //         const whl = path.join(packages_dir, file);
          //         try {
          //             const log = execSync(pythonPath + " -m pip install " + whl + " --user --no-warn-script-location", {
          //                 cwd: filePath
          //             });
          //             console.log("python依赖库 " + file + " 安装完成：", log.toString());
          //         } catch (e) {
          //             console.log("python依赖库 " + file + " 安装出错：", e);
          //         }
          //     })
          // }
        } else {
          console.log('开始在线安装python依赖库')
          exec(pythonPath + ` -m pip install -r requirements.txt -i http://mirrors.aliyun.com/pypi/simple --trusted-host mirrors.aliyun.com`, {
            cwd: filePath
          }, (error, stdout, stderr) => {
            if (error) {
              console.log('python依赖库在线安装出错：', error)
              reject(error)
            } else {
              resolve('Success')
            }
          })
        }

        if (os.platform() === 'win32') {
          lineContents[85] = 'USER_SITE = None'
          fs.writeFileSync(sitePyPath, lineContents.join('\n'))
        }

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
        //         resolve("Success");
        //     }

        //     lineContents[85] = 'USER_SITE = None';
        //     fs.writeFileSync(sitePyPath, lineContents.join('\n'));
        // })
      } else {
        reject('系统找不到python版本')
      }
    } else {
      reject('系统找不到依赖文件')
    }
  })
}

// python  packages.json生成缓存文件
export function pythonGenerateCache(filePath) {

  let pythonPath = ""
  if (os.platform() === 'win32') {
    pythonPath = path.normalize(path.join(path.resolve() + `/env/python/${os.platform()}/python.exe}`))
  } else if (os.platform() === 'linux') {
    pythonPath = path.normalize(path.join(path.resolve() + `/env/python/${os.platform()}/python`))
  } else if (os.platform() === 'darwin') {
    if (path.resolve() == '/') {
      pythonPath = path.normalize(app.getPath("exe") + '../../../env/python/darwin/bin/python3')
    } else {
      pythonPath = path.normalize(path.join(path.resolve() + `/env/python/${os.platform()}/bin/python3`))
    }
  }


  return new Promise((resolve, reject) => {
    exec(`${pythonPath} -m pip wheel --wheel-dir packages -f packages -r requirements.txt`, {
      cwd: filePath,
      windowsHide: true
    }, (error, stdout, stderr) => {
      resolve('success')
    })
  })
}
