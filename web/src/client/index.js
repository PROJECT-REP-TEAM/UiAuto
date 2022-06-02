const {
  app,
  BrowserWindow,
  dialog,
  Tray,
  Menu,
  ipcMain,
  MenuItem,
  globalShortcut,
  screen
} = window.nodeRequire('@electron/remote');

const {
  execSync,
  exec
} = window.nodeRequire('child_process');
const path = window.nodeRequire('path');
const fs = window.nodeRequire('fs');
const fse = window.nodeRequire('fs-extra')
const os = window.nodeRequire('os');
const https = window.nodeRequire('https');
const decompress = window.nodeRequire('decompress');
const fkill = window.nodeRequire('fkill')
const async = window.nodeRequire('async')
const {
  Task,
  Log
} = require('../express/database')

var tray, dialogShowMessageBox = null;

export const init = () => {
  if (os.platform() == 'win32') {
    createTray();
  }
  checkChromeDriver();
  initPythonEnvironment();
  regDevToolsHotKey();
  initAllEvent();
  // 关闭窗体，弹出提示。
  var mainWindow = getCurrentBrowserWindow();
  mainWindow.on('close', (e) => {
    e.preventDefault();
    comfirmExitApp();
  })
}

/**
 * 注册热键
 */
export const regDevToolsHotKey = () => {
  var mainWindow = getCurrentBrowserWindow();
  const accelerator = 'ctrl+alt+shift+i';
  const ret = globalShortcut.register(accelerator, () => {
    console.log(`${accelerator} is pressed`);
    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools();
    } else {
      mainWindow.webContents.openDevTools();
    }
  });

  if (!ret) {
    console.log('registration failed')
  }

  // 检查快捷键是否注册成功
  console.log(globalShortcut.isRegistered(accelerator));
}



// 返回当前主窗口
export const getCurrentBrowserWindow = () => {
  var browserWindow = BrowserWindow.getAllWindows()[0];
  return browserWindow;
}


/**
 * 退出应用程序
 */
export const comfirmExitApp = () => {
  if (!dialogShowMessageBox) {
    dialogShowMessageBox = dialog.showMessageBox({
      type: 'question',
      title: '提示',
      defaultId: 0,
      message: '退出后，将不能正常执行定时任务，确定要退出吗？',
      buttons: ['确定', '取消']
    }).then(function (result) {
      if (result.response == 0) {
        if (os.platform() === 'win32') {
          try {
            // 清理chromedriver、录屏、iedrvierserver进程
            let taskkill_shell = execSync('taskkill /f /im chromedriver.exe /im ffmpeg.exe /im ffmpeg /im IEDriverServer.exe')
            console.log(taskkill_shell.toString())
          } catch (e) {
            // console.error('清理进程错误：', e)
          }
        } else if (os.platform() === 'darwin') {
          try {
            // 清理chromedriver、录屏、iedrvierserver进程
            let taskkill_shell = execSync('pkill -KILL -i chromedriver ffmpeg IEDriverServer')
            console.log(taskkill_shell.toString())
          } catch (e) {
            // console.error('清理进程错误：', e)
          }
        } else {
          try {
            // 清理chromedriver、录屏、iedrvierserver进程
            let taskkill_shell = execSync('killall -9 -I chromedriver ffmpeg IEDriverServer')
            console.log(taskkill_shell.toString())
          } catch (e) {
            // console.error('清理进程错误：', e)
          }
        }
        CloseJob().then(res => {
          // 关闭python线程
          window['py_shell'].terminate();
          var mainWindow = getCurrentBrowserWindow();
          mainWindow = null;
          app.exit()
        }).catch(err => {
          // 关闭python线程
          window['py_shell'].terminate();
          var mainWindow = getCurrentBrowserWindow();
          mainWindow = null;
          app.exit()
        })
      }
      dialogShowMessageBox = null;
    })
  }

}

// 更新正在执行的任务状态
const CloseJob = async () => {
  return new Promise(async (resolve, reject) => {
    Task.findAll({
      where: {
        status: "executing"
      }
    }).then(function (tasks) {
      if (tasks) {
        async.mapSeries(tasks, function (item, cb) {
          Log.findOne({
            where: {
              taskId: item.id,
            },
            order: [
              ["lineNo", "desc"]
            ],
          }).then(function (log) {
            if (log) {
              Log.create({
                taskId: item.id,
                logType: "error",
                content: `程序关闭，项目【${item.taskName}】执行失败`,
                lineNo: log.lineNo++
              }).then(res => {
                cb(null, null)
              }).catch(err => [
                cb(null, null)
              ])
            } else {
              cb(null, null)
            }
          }).catch(err => {
            cb(null, null)
          })
        }, function (err, results) {
          Task.update({
            status: "error"
          }, {
            where: {
              status: "executing"
            }
          }).then(res => {
            resolve()
          }).catch(err => [
            resolve()
          ])
        })
      } else {
        resolve()
      }
    }).catch(error => {
      resolve()
    })
  })
}

/**
 * 隐藏主窗体
 */
function hideOrShowMainWindow() {
  var mainWindow = getCurrentBrowserWindow();
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
  }
}


/**
 * 创建系统托盘
 */
export const createTray = () => {
  tray = new Tray(`${path.resolve()}/build/icon.ico`)
  const contextMenu = Menu.buildFromTemplate([
    new MenuItem({
      label: '显示窗口',
      type: 'normal',
      click: function (menuItem, browserWindow, event) {
        var mainWindow = getCurrentBrowserWindow();
        mainWindow.show();
      }
    }),
    new MenuItem({
      label: '退出',
      type: 'normal',
      click: function (menuItem, browserWindow, event) {
        comfirmExitApp();
      }
    })
  ])
  tray.setToolTip('UIAUTO-览众RPA平台');
  tray.setContextMenu(contextMenu);
  // tray.on('double-click', function (event, position) {
  // hideOrShowMainWindow();
  // });
  tray.on('click', function (event, position) {
    hideOrShowMainWindow();
  });
}

export const destroyTray = () => {
  return new Promise(async (resolve, reject) => {
    try {
      if (os.platform() == 'win32' || os.platform() == 'browser' && tray) {
        tray.destroy()
        tray = null
      }
      resolve()
    } catch (error) {
      reject(error)
    }

  })
}



/**
 * 初始化所有事件
 */
export const initAllEvent = () => {
  var mainWindow = getCurrentBrowserWindow();
  console.log("ipcMain")
  console.log(ipcMain)
  /**
   * {
    filters: [
      { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
      { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] },
      { name: 'Custom File Type', extensions: ['as'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  }
   */
  ipcMain.on('file-selector', function (event, options = {}) {
    console.log("Enter file selector");
    console.log(options);
    const windows = BrowserWindow.fromWebContents(event.sender);
    let file_options = {}
    if (os.platform() === 'linux') {
      file_options = {
        properties: options.properties || ["openFile"],
      }
    } else {
      file_options = {
        properties: options.properties || ["openFile"],
        filters: [{
          name: options.filters_name || "All Files",
          extensions: options.filters_extensions || ["*"]
        }]
      }
    }
    dialog.showOpenDialog(
      windows, file_options
      // , function (paths) {
      //         console.log(paths);
      //         console.log(options.listener_name);
      //         event.sender.send(options.listener_name || 'file-selector-result', options.params ? {
      //             paths: paths,
      //             params: options.params
      //         } : paths);
      //     }
    ).then(result => {
      console.log(result.filePaths)
      event.sender.send(options.listener_name || 'file-selector-result', options.params ? {
        paths: result.filePaths,
        params: options.params
      } : result.filePaths);
    }).catch(err => {
      console.log("showOpenDialog err")
      console.log(err)
    });
  });

  ipcMain.on('open-error-dialog', (event, arg) => {
    console.log("open-error-dialog");
    console.log(arg);
    dialog.showErrorBox('错误', arg)
  })

  ipcMain.on('window_maximize', (event) => {
    mainWindow.maximize()
    if (os.platform() === 'linux') {
      mainWindow.focus()
    }
  })

  ipcMain.on('window_minimize', (event) => {
    mainWindow.minimize()
  })

  ipcMain.on('window_setContentSize', (event) => {
    if (mainWindow.isMaximized()) {
      let { width, height } = screen.getPrimaryDisplay().workAreaSize;
      mainWindow.restore(); // window全屏下需要先恢复窗口才能修改
      mainWindow.setContentSize(parseInt(width * 0.8), parseInt(height * 0.8));
      mainWindow.center();
    } else {
      mainWindow.maximize()
      if (os.platform() === 'linux') {
        mainWindow.focus()
      }
    }
  })

  ipcMain.on('open-dev-tools', (event) => {
    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools();
    } else {
      mainWindow.webContents.openDevTools();
    }
  })

  // ipcMain.on("download", (event, options = {}) => {
  //   // console.log(options);
  //   // axios download code here
  //   axios({
  //     method: "post",
  //     url: "http://192.168.1.108:4399/api/v1/plugins/download",
  //     data: qs.stringify({
  //       plugin_id: 'withoutNodeModules'
  //     }),
  //     headers: {
  //       "X-Requested-With": "XMLHttpRequest",
  //       "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
  //     },
  //     responseType: 'stream'
  //   })
  //     .then(response => {
  //       console.log("请求成功返回的数据");
  //       console.log(response.headers)
  //       console.log(response.headers['content-md5'])
  //       console.log(response.headers['content-length'])
  //       var fileSize = response.headers['content-length'] || 300
  //       var fileMD5 = response.headers['content-md5'] || null
  //       var str = progress({
  //         length: fileSize,
  //         time: 100
  //       });
  //       str.on('progress', function (progress) {
  //         console.log(Math.round(progress.percentage) + '%');
  //         event.sender.send(options.listener_name, { progress: progress.percentage, fileMD5: fileMD5 })
  //       });
  //       response.data.pipe(str).pipe(fs.createWriteStream(options.zipFilePath))
  //       console.log("123213123");
  //       // event.sender.send(options.listener_name, options.zipFilePath)
  //     })
  //     .catch(error => {
  //       console.log("请求失败返回的数据");
  //       console.log(error);
  //       event.sender.send(options.listener_name, { progress: 500, fileMD5: null })
  //     });
  // });


}

// 初始化python环境
export const initPythonEnvironment = async () => {
  return new Promise(async (resolve, reject) => {
    let pythonPath, requirementsPath, execPath, whls_dir;
    if (os.platform() === 'win32') {
      pythonPath = path.normalize(path.join(path.resolve() + `/env/python/${os.platform()}/python.exe`))
      requirementsPath = path.normalize(path.join(path.resolve() + `/public/base_integration/uiauto_executor/requirements.txt`))
      execPath = path.normalize(path.join(path.resolve() + `/env/python/${os.platform()}/`))
      whls_dir = path.normalize(path.join(path.resolve() + `/env/python/${os.platform()}/whls/`))
    } else if (os.platform() === 'linux') {
      pythonPath = path.normalize(path.join(path.resolve() + `/env/python/${os.platform()}/python`))
      requirementsPath = path.normalize(path.join(path.resolve() + `/public/base_integration/uiauto_executor/requirements.txt`))
      execPath = path.normalize(path.join(path.resolve() + `/env/python/${os.platform()}/`))
      whls_dir = path.normalize(path.join(path.resolve() + `/env/python/${os.platform()}/whls/`))
    } else if (os.platform() === 'darwin') {
      if (path.resolve() == "/") {
        pythonPath = path.normalize(app.getPath("exe") + '../../../env/python/darwin/bin/python3')
        requirementsPath = path.normalize(app.getPath("exe") + '../../../public/base_integration/uiauto_executor/requirements.txt')
        execPath = path.normalize(app.getPath("exe") + '../../../env/python/darwin/')
        whls_dir = path.normalize(app.getPath("exe") + '../../../env/python/darwin/whls/')
      } else {
        pythonPath = path.normalize(path.join(path.resolve() + `/env/python/${os.platform()}/bin/python3`))
        requirementsPath = path.normalize(path.join(path.resolve() + `/public/base_integration/uiauto_executor/requirements.txt`))
        execPath = path.normalize(path.join(path.resolve() + `/env/python/${os.platform()}/`))
        whls_dir = path.normalize(path.join(path.resolve() + `/env/python/${os.platform()}/whls/`))
      }
    }

    if (os.platform() === 'linux') {
      try {
        execSync(pythonPath + ' -m ensurepip --upgrade')
      } catch (error) {
        console.log('linux pip error：', error)
        reject(error)
      }
    }
    if (fs.existsSync(whls_dir)) {
      exec(pythonPath + ` -m pip install -r ${requirementsPath} --no-index --find-links=` + whls_dir, {
        cwd: execPath
      }, (error, stdout, stderr) => {
        if (error) {
          console.log('python依赖离线安装出错：', error)
          exec(pythonPath + ` -m pip install -r ${requirementsPath} -i http://mirrors.aliyun.com/pypi/simple --trusted-host mirrors.aliyun.com`, {
            cwd: execPath
          }, (error, stdout, stderr) => {
            if (error) {
              console.log('初始化python环境失败：', error)
              reject(error)
            } else {
              resolve('Success')
            }
          })
        } else {
          resolve('Success')
        }
      })
    } else {
      exec(pythonPath + ` -m pip install -r ${requirementsPath} -i http://mirrors.aliyun.com/pypi/simple --trusted-host mirrors.aliyun.com`, {
        cwd: execPath
      }, (error, stdout, stderr) => {
        if (error) {
          console.log('初始化python环境失败：', error)
          reject(error)
        } else {
          resolve('Success')
        }
      })
    }
  })
}


// 检测chromedriver版本是否与chrome版本相符
export const checkChromeDriver = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      let version = '';

      if (os.platform() == 'win32') {
        // let shell_result = execSync('REG QUERY "HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Google Chrome" /v version')
        // shell_result = shell_result.toString('UTF-8')
        // shell_result = shell_result.split('    ')
        // version = shell_result[shell_result.length - 1].split('.')
        // version = _.slice(version, 0, version.length - 1).join('.')
        let shell_result = execSync('REG QUERY "HKEY_CURRENT_USER\\SOFTWARE\\Google\\Chrome\\BLBeacon')
        shell_result = shell_result.toString('UTF-8')
        shell_result = shell_result.split('    ')
        version = shell_result[3].split('.')
        version = _.slice(version, 0, version.length - 1).join('.')
        console.log('version>>>>>>>>>>>>>', version)
      }

      if (os.platform() == 'darwin') {
        var plist = window.nodeRequire('plist');
        var obj = plist.parse(fs.readFileSync('/Applications/Google Chrome.app/Contents/Info.plist', 'utf8'));
        version = obj.KSVersion.substring(0, obj.KSVersion.lastIndexOf("."));
        console.log('version>>>>>>>>>>>>>', version)
      }

      if (os.platform() == 'linux') {
        let shell_result = execSync('google-chrome --version')
        shell_result = shell_result.toString('UTF-8')
        let version_result = shell_result.replace(/[a-zA-Z]\s*/g, '')
        version = version_result.substring(0, version_result.lastIndexOf("."));
        console.log('version>>>>>>>>>>>>>', version);
      }

      const currentChromeDriverVersion = getCurrentChromeDriverVersion()

      if (currentChromeDriverVersion.indexOf(version) === -1) {
        console.log('currentChromeDriverVersion>>>>>>>>>>>>>>>', currentChromeDriverVersion)
        console.log('chromedirver 版本不适配')
        console.log('杀灭当前chromedirver进程')
        await fkill(['chromedriver.exe', 'chromedriver'], {
          force: true,
          silent: true
        }).catch(err => {
          console.log('杀灭chromedirver进程失败：' + err)
        })
        const latest_release_version = await get_chrome_driver_release_by_installed_chrome_version(version)
        console.log('latest_release_version>>>>>>', latest_release_version)

        await downloadChromeDriver(latest_release_version)
        // 授权执行文件
        if (os.platform() == 'linux') {
          execSync(`chmod +x ${path.normalize(path.join(path.resolve(), '/env/webdriver/' + os.platform() + '/chromedriver'))}`)
        }
        if (os.platform() == 'darwin') {
          execSync(`chmod +x ${path.join(path.normalize(app.getPath("exe") + '../../..'), '/env/webdriver/' + os.platform() + '/chromedriver')}`)
        }
        resolve("chromedirver 安装完成")
      } else {
        // 授权执行文件
        if (os.platform() == 'linux') {
          execSync(`chmod +x ${path.normalize(path.join(path.resolve(), '/env/webdriver/' + os.platform() + '/chromedriver'))}`)
        }
        if (os.platform() == 'darwin') {
          execSync(`chmod +x ${path.join(path.normalize(app.getPath("exe") + '../../..'), '/env/webdriver/' + os.platform() + '/chromedriver')}`)
        }
        resolve("chromedirver 版本适配")
      }
    } catch (e) {
      console.error('未检测到本机安装的Chrome浏览器')
      console.log(e)
      reject()
    }
  })
}

/**
 * 根据已经安装的chrome版本
 * @param {*} chrome_version 
 * @returns 
 */
const get_chrome_driver_release_by_installed_chrome_version = (chrome_version) => {
  return new Promise((resolve, reject) => {
    https.get('https://cdn.npmmirror.com/binaries/chromedriver/LATEST_RELEASE_' + chrome_version, (res) => {
      res.on('data', (data) => {
        console.log('https data', data.toString())
        resolve(data.toString())
      })
      res.on('end', () => {
        console.log('https end')
      })
    }).on('error', (error) => {
      console.log('https error', error)
      reject(error)
    })
  })
}

/**
 * 下载最新版本的chrome驱动
 * @returns 
 */
// https://registry.npmmirror.com/-/binary/chromedriver/99.0.4844.35/chromedriver_win32.zip
const downloadChromeDriver = (latest_release_version) => {
  return new Promise((resolve, reject) => {
    console.log('=========================latest_release_version=================================')
    console.log(latest_release_version)
    var plat = os.platform();
    var platName = '';
    if (plat == 'darwin') {
      platName = 'mac64';
    } else if (plat == 'linux') {
      platName = 'linux64';
    } else {
      platName = 'win32';
    }

    // https://cdn.npmmirror.com/binaries/chromedriver/99.0.4844.35/chromedriver_win32.zip   linux64.zip   mac64.zip   mac64_m1.zip    win32

    var downloadUrl = 'https://cdn.npmmirror.com/binaries/chromedriver/' + latest_release_version + '/chromedriver_' + platName + '.zip'
    console.log('============================downloadUrl==============================')
    console.log(downloadUrl)
    https.get(downloadUrl, (res) => {
      let zipFilePath;
      if (os.platform() == "darwin" && path.resolve() == "/") {
        fse.ensureDir(path.normalize(app.getPath("exe") + '../../../.uiauto/temp/'))
        zipFilePath = path.normalize(app.getPath("exe") + '../../../.uiauto/temp/chromedriver.zip')
      } else {
        fse.ensureDir(path.normalize(path.join(path.resolve(), '/.uiauto/temp/')))
        zipFilePath = path.join(path.resolve(), '/.uiauto/temp/chromedriver.zip')
      }
      console.log('========================================zipFilePath=======================================')
      console.log(zipFilePath)
      const writeStream = fs.createWriteStream(zipFilePath)
      res.on('data', (data) => {
        writeStream.write(data)
      })
      res.on('end', () => {
        console.log('downloadChromeDriver https end')
        writeStream.close()
      })

      writeStream.on('finish', () => {
        console.log('downloadChromeDriver finish')
        let driveFilePath;
        if (os.platform() == "darwin" && path.resolve() == "/") {
          driveFilePath = path.join(path.normalize(app.getPath("exe") + '../../..'), '/env/webdriver/' + plat + '');
        } else {
          driveFilePath = path.normalize(path.join(path.resolve(), '/env/webdriver/' + plat + ''));
        }
        decompress(zipFilePath, driveFilePath)
          .then((files) => {
            console.log('downloadChromeDriver success>>>>>>>', files)

            // fs.unlinkSync(zipFilePath)
            fs.writeFileSync(driveFilePath + '/version', latest_release_version.substring(0, latest_release_version.lastIndexOf(".")));
            resolve(true)
          })
          .catch((error) => {
            console.log('downloadChromeDriver error>>>>>>>', error)
            reject(error)
          })
      })
    }).on('error', (error) => {
      console.log('downloadChromeDriver https error', error)
      reject(error)
    })
  })
}

/**
 * 获取当前已经安装的chrome驱动版本
 * @returns 
 */
const getCurrentChromeDriverVersion = () => {
  console.log("getCurrentChromeDriverVersion -=-=-=-=-=-=")
  console.log(os.platform())
  if (os.platform() == 'win32') {
    const driver_path = path.normalize(path.join(path.resolve(), '/env/webdriver/' + os.platform() + '/chromedriver.exe'))

    if (fse.pathExistsSync(driver_path)) {
      const driver_shell = execSync(driver_path + ' --version')
      return driver_shell.toString().split(' ')[1]
    } else {
      return ""
    }

  } else {
    const driver_path = path.normalize(path.join(path.resolve(), '/env/webdriver/' + os.platform() + '/version'))
    if (fse.pathExistsSync(driver_path)) {
      return fs.readFileSync(driver_path, 'utf8')
    } else {
      return ""
    }
  }
}
