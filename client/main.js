// Modules to control application life and create native browser window
const electron = require('electron');
const {
  app,
  BrowserWindow,
  dialog
} = electron;
const fs = require('fs');
const path = require('path');
const os = require('os')
const _ = require('lodash');
// require(path.resolve() + '/public/utils/ConsoleUtils').init();
const fse = require('fs-extra');
const {
  execSync
} = require('child_process');
require('@electron/remote/main').initialize()
const axios = require('axios');

let uiauto_config = {}

if (fs.existsSync(path.normalize(`${os.homedir()}/.uiauto/uiauto.conf`))) {
  uiauto_config = fse.readJsonSync(path.normalize(`${os.homedir()}/.uiauto/uiauto.conf`));
}

let web_url_file, web_url;
if (os.platform() === 'darwin' && path.resolve() == '/') {
  web_url_file = path.normalize(app.getPath("exe") + '../../../web_url')
} else {
  web_url_file = path.normalize(path.resolve() + "/web_url")
}
if (fs.existsSync(web_url_file)) {
  web_url = fs.readFileSync(web_url_file).toString();
} else if (uiauto_config && uiauto_config.web_url) {
  web_url = uiauto_config.web_url;
} else {
  web_url = `http://uiauto-web.legion-tech.net/index.html?t=${new Date().getTime()}`;
}
console.log('web_url', web_url)

axios({
  method: 'get',
  url: web_url,
  headers: {}
})
  .then(function (response) {
    var rootPath = path.normalize(__dirname + '/../..');
    console.log("root path:" + rootPath);
    console.log("test>>>>>>", path.resolve())

    let mainWindow

    function createWindow() {
      const {
        width,
        height
      } = electron.screen.getPrimaryDisplay().workAreaSize;
      // Create the browser window.
      mainWindow = new BrowserWindow({
        // x: 0,
        // y: 0,
        width: width,
        height: height,
        // width: 1280,
        // height: 900,
        // backgroundColor: '#304156',
        frame: false,
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: true,
          nodeIntegrationInWorker: true,
          contextIsolation: false,
          // nodeIntegrationInSubFrames: true,
          webSecurity: false
        },
        icon: path.join(path.resolve(), "/build/icon.png")
      });

      require("@electron/remote/main").enable(mainWindow.webContents);

      // mainWindow.webContents.openDevTools();
      // BrowserWindow.webContents.openDevTools();

      mainWindow.loadURL(web_url);

      // Emitted when the window is closed.
      mainWindow.on('close', function (e) {
        console.log('close>>>>>>>>>>>>>>>>>')
        e.preventDefault();
        mainWindow = null;
      })

    }

    const gotTheLock = app.requestSingleInstanceLock()
    if (!gotTheLock) {
      console.log("gotTheLock haveLock")
      app.quit()
    } else {

      // This method will be called when Electron has finished
      // initialization and is ready to create browser windows.
      // Some APIs can only be used after this event occurs.
      app.whenReady().then(() => {
        console.log('app ready>>>>>>>')
        console.log(process.platform);

        console.log(path.normalize(`${os.homedir()}/.uiauto/uiauto.conf`))
        const configPath = path.normalize(`${os.homedir()}/.uiauto/uiauto.conf`)
        const default_config = {
          'pluginsPath': (os.platform() === 'darwin' && path.resolve() == '/') ? path.normalize(app.getPath("exe") + '../../../UiAuto_files/plugins') : path.normalize(path.join(path.resolve() + `/UiAuto_files/plugins`)),
          'projectsPath': (os.platform() === 'darwin' && path.resolve() == '/') ? path.normalize(app.getPath("exe") + '../../../UiAuto_files/projects') : path.normalize(`${os.homedir()}/UiAuto_files/projects`),
          'storePath': (os.platform() === 'darwin' && path.resolve() == '/') ? path.normalize(app.getPath("exe") + '../../../UiAuto_files/store') : path.normalize(`${os.homedir()}/UiAuto_files/store`),
          'serverUrl': 'http://uiauto-api.legion-tech.net/legion',
          'pythonPath': '',
          'pipSource': [],
          'npmSource': [],
          'isOpenAtLogin': false
        }

        if (!fs.existsSync(`${os.homedir()}/.uiauto`)) {
          fs.mkdirSync(`${os.homedir()}/.uiauto`)
        }

        if (!fs.existsSync(`${os.homedir()}/UiAuto_files`)) {
          fs.mkdirSync(`${os.homedir()}/UiAuto_files`)
        }

        var config = default_config
        if (!fs.existsSync(configPath)) {
          fse.outputFileSync(configPath, JSON.stringify(default_config, null, '\t'), 'utf8')
        } else if (fs.existsSync(configPath)) {
          // 当存在时检测是否缺漏属性
          let config_data = JSON.parse(fs.readFileSync(configPath).toString());
          let differenceList = _.difference(_.keys(default_config), _.keys(config_data));
          if (differenceList.length) {
            _.each(differenceList, item => {
              config_data[item] = default_config[item]
            })
          }
          fse.outputFileSync(configPath, JSON.stringify(config_data, null, '\t'), 'utf8')
        }

        try {
          config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
          console.log('read success')
        } catch (err) {
          fs.writeFileSync(configPath, JSON.stringify(default_config), 'utf8')
          console.log('create success')
        }

        if (!fs.existsSync((os.platform() === 'darwin' && path.resolve() == '/') ? path.normalize(app.getPath("exe") + '../../../UiAuto_files') : path.normalize(path.join(path.resolve() + `/UiAuto_files`)))) {
          fs.mkdirSync((os.platform() === 'darwin' && path.resolve() == '/') ? path.normalize(app.getPath("exe") + '../../../UiAuto_files') : path.normalize(path.join(path.resolve() + `/UiAuto_files`)))
        }

        if (!fs.existsSync(config.pluginsPath)) {
          fs.mkdirSync(config.pluginsPath)
        }

        if (!fs.existsSync(config.projectsPath)) {
          fs.mkdirSync(config.projectsPath)
        }

        if (!fs.existsSync(config.storePath)) {
          fs.mkdirSync(config.storePath)
        }

        if (!config.hasOwnProperty('pipSource')) {
          config['pipSource'] = default_config.pipSource
          fs.writeFileSync(configPath, JSON.stringify(config), 'utf8')
        }
        if (!config.hasOwnProperty('npmSource')) {
          config['npmSource'] = default_config.npmSource
          fs.writeFileSync(configPath, JSON.stringify(config), 'utf8')
        }

        if (process.platform == 'win32') {
          electron.shell.writeShortcutLink(path.join(path.resolve(), 'UiAuto.lnk'), 'create', {
            target: process.execPath,
            workingDirectory: path.dirname(process.execPath),
            icon: path.join(path.resolve(), '/build/icon.ico'),
            iconIndex: 0,
            description: 'UIAUTO'
          });

          // 自启动文件
          fs.writeFileSync(path.normalize(path.resolve() + '/public/utils/selfStart.bat'), `cd ${path.resolve()}\n\nstart ${path.resolve()}\\UiAuto.exe`);

          // 修改注册表(跳过“你要允许来自未知发布者的此应用对你的设备进行更改吗”弹出框)
          let keyPath = 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers';
          try {
            console.log("-=-=-=-==-=-", `REG ADD "${keyPath}" /v "${path.resolve()}\\UiAuto.exe" /t REG_SZ /d "~ RunAsInvoker" /f`)
            execSync(`REG ADD "${keyPath}" /v "${path.resolve()}\\UiAuto.exe" /t REG_SZ /d "~ RunAsInvoker" /f`)
          } catch (error) {
            console.log('errorerror', error)
          }

          if (app.isPackaged && uiauto_config.isOpenAtLogin) {
            if (!app.getLoginItemSettings({
              path: path.normalize(path.resolve() + '/public/utils/selfStart.bat')
            }).openAtLogin) {
              app.setLoginItemSettings({
                openAtLogin: true,
                openAsHidden: false,
                path: path.normalize(path.resolve() + '/public/utils/selfStart.bat')
              })
            }
          } else {
            app.setLoginItemSettings({
              openAtLogin: false
            })
          }
        }
        createWindow();
      })


      app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow === null) createWindow()
      })

    }

    // In this file you can include the rest of your app's specific main process
    // code. You can also put them in separate files and require them here.

  })
  .catch(function (error) {
    setTimeout(() => {
      dialog.showMessageBox({
        type: 'question',
        title: '关闭',
        defaultId: 0,
        message: '前端网址访问失败，请联系管理员',
        buttons: ['确定']
      }).then(() => {
        app.exit()
      })
    }, 1000);

  });