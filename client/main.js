// Modules to control application life and create native browser window
const electron = require('electron');
const { PythonShell } = require('python-shell');
const {
  app,
  BrowserWindow,
  dialog,
  ipcMain
} = electron;
const fs = require('fs');
const path = require('path');
const os = require('os')
const url = require('url');
const _ = require('lodash');
const axios = require('axios')
const qs = require('qs')
const progress = require('progress-stream');
const express = require('express');
const {execSync} = require('child_process')
require(path.resolve() + '/public/utils/ConsoleUtils').init();

var rootPath = path.normalize(__dirname + '/../..');
console.log(rootPath);

var configPath = ''

// var ipc = window.require("electron").remote.ipcMain;
// var dialog = window.require("electron").remote.dialog;
// var BrowserWindow = window.require("electron").remote.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function initDevTool() {
  switch (os.platform()) {
    case 'darwin':
      var devToolPath = path.join(os.homedir(), '/Library/Application Support/Google/Chrome/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd');
      break;
    case 'win32':
      var devToolPath = path.join(os.homedir(), 'AppData/Local/Google/Chrome/User Data/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd');
      break;
    default:
      break;
  }
  if (fs.existsSync(devToolPath)) {
    var version = _.head(_.dropWhile(fs.readdirSync(devToolPath), (fileName) => {
      return ['.DS_Store'].includes(fileName);
    }));
    BrowserWindow.addDevToolsExtension(`${devToolPath}/${version}`);
  }
}

function createWindow() {

  initDevTool();
  const {
    width,
    height
  } = electron.screen.getPrimaryDisplay().workAreaSize;
  // Create the browser window.
  mainWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width: width,
    height: height,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false
    }
  });

  mainWindow.maximize();
  const web_url_file = path.normalize(path.resolve() + "/web_url")
  if (fs.existsSync(web_url_file)) {
    const web_url = fs.readFileSync(web_url_file).toString();
    mainWindow.loadURL(web_url);
  } else {
    mainWindow.loadURL('http://rpa.legion-tech.net');
    // mainWindow.loadURL('http://localhost:9528');
  }

  const accelerator = 'ctrl+alt+shift+i';
  const ret = electron.globalShortcut.register(accelerator, () => {
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
  console.log(electron.globalShortcut.isRegistered(accelerator));

  // mainWindow.loadURL(url.format({
  //   pathname: path.join(__dirname, 'web/index.html'),
  //   protocol: 'file:',
  //   slashes: true
  // }));

  // and load the index.html of the app.
  // mainWindow.loadFile('web/dist/web/index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.webContents.session.on('will-download', (e, item, webContents) => {
    console.log("mainWindow webContents")
    console.log(configPath)
    console.log(e)
    console.log(item)
    console.log(webContents)
    console.log(item.getURL())
    //获取文件的总大小
    const totalBytes = item.getTotalBytes();
    const fileName = item.getFilename()
    // const file_Name = fileName.substring(0, fileName.lastIndexOf('.'))
    console.log(item.getFilename())
    //检查有无plugins_temp文件夹，无则创建
    if (configPath != "" && !fs.existsSync(configPath)) {
      fs.mkdirSync(configPath)
    }
    //设置文件的保存路径，此时默认弹出的 save dialog 将被覆盖
    const filePath = configPath + fileName
    // const filePath = path.normalize(
    //   path.resolve() + "/.." + "/web/public/plugins_temp/" + fileName
    // );
    item.setSavePath(filePath);

    //监听下载过程，计算并设置进度条进度
    item.on('updated', (e, state) => {
      console.log("updated", state);
      console.log(totalBytes)
      console.log(item.getReceivedBytes())
      const percentage = parseInt(item.getReceivedBytes() / totalBytes * 100 * 0.8)
      console.log(percentage)
      mainWindow.webContents.send('downstate' + fileName, {
        progress: percentage,
        filePath: filePath,
        state: state
      })
    });

    //监听下载结束事件
    item.on('done', (e, state) => {
      const percentage = parseInt(item.getReceivedBytes() / totalBytes * 100 * 0.8)
      //下载完成
      if (state === 'completed') {
        console.log('Download successfully')
        mainWindow.webContents.send('downstate' + fileName, {
          progress: percentage,
          filePath: filePath,
          state: state
        })
      } else {
        console.log(`Download failed: ${state}`)
        mainWindow.webContents.send('downstate' + fileName, {
          progress: percentage,
          filePath: filePath,
          state: state
        })
      }

    });

  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function (e) {
    console.log('closed>>>>>>>>>>>>>>>>>')
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
    
    // electron.session.defaultSession.clearStorageData({
    //   // without set origin options
    //   storages: ['localstorage']
    // }, () => {
    //   // verify if storages got cleared.
    // })
  })

  mainWindow.on('close', (e) => {
      e.preventDefault();
      electron.dialog.showMessageBox({
        type: 'question',
        title: '提示',
        defaultId: 0,
        message: '确定要退出吗？',
        buttons: ['确定', '取消']
      }, (index) => {
        if (index === 0) {
          try {
            // 清理chromedriver进程
            let taskkill_shell = execSync('taskkill /f /im "chromedriver.exe"')
            console.log(taskkill_shell.toString())
          } catch (e) {
            // console.error('清理chromedriver进程错误：', e)
          }

          try {
            // 清理iedrvierserver.exe进程
            let taskkill_shell = execSync('taskkill /f /im "IEDriverServer.exe"')
            console.log(taskkill_shell.toString())
          } catch (e) {
            // console.error('清理IEDriverServer进程错误：', e)
          }

          mainWindow = null
          app.exit()
        } else {

        }
      })
  })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

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
  dialog.showOpenDialog(
    windows, {
      properties: options.properties || ["openFile"],
      filters: [{
        name: options.filters_name || "All Files",
        extensions: options.filters_extensions || ["*"]
      }]
    },
    function (paths) {
      console.log(paths);
      event.sender.send(options.listener_name || 'file-selector-result', options.params ? {
        paths: paths,
        params: options.params
      } : paths);
    }
  );
});

ipcMain.on('open-error-dialog', (event, arg) => {
  console.log("open-error-dialog");
  console.log(arg);
  dialog.showErrorBox('错误', arg)
})

ipcMain.on('download', (event, options = {}) => {
  var downloadpath = options.downloadPath;
  configPath = options.configPath;
  //下面这句会触发will-download事件
  mainWindow.webContents.downloadURL(downloadpath);
})

ipcMain.on('window_maximize', (event) => {
  mainWindow.maximize()
})

ipcMain.on('window_minimize', (event) => {
  mainWindow.minimize()
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
