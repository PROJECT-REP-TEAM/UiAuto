// let require = window.require;
let fs;
let fse;
let readLine;
let path;
let os;
let fileRootPath;
let chokidar;
let filePath = '';
let _;

if (typeof window !== "undefined") {
  fs = window.require('fs');
  fse = window.require('fs-extra');
  readLine = window.require('readline');
  path = window.require('path');
  os = window.require('os')
  fileRootPath = `${path.resolve()}/.uiauto/`;
  chokidar = window.require('chokidar');
  _ = window.require('lodash');
} else {
  fs = require('fs');
  fse = require('fs-extra');
  readLine = require('readline');
  path = require('path');
  os = require('os')
  fileRootPath = `${path.resolve()}/.uiauto/`;
  chokidar = require('chokidar');
  _ = require('lodash');
}


const MAX_HISTORY_LEN = 10;
var rl, wfs = {};

// 先处理已有的数据
function init(projectName, historyCB, newCB) {
  try {
    rl.close();
    historyLogsArr = []
  } catch (err) {
    // console.warn(err);
  }
  filePath = fileRootPath + projectName + '/.uiauto.log';
  // console.log(filePath);
  fse.ensureFileSync(filePath);
  fetchHistoryLogs(projectName, historyCB, newCB);
}
exports.init = init;

function fetchHistoryLogs(projectName, historyCB, newCB) {
  var historyLogsArr = [];
  rl = readLine.createInterface({
    input: fs.createReadStream(filePath, {
      enconding: 'utf8'
    }),
    output: null,
    terminal: false //这个参数很重要
  });

  rl.on('line', function (line) {
    // console.error(line)
    if (line) {
       historyLogsArr.push(line.toString().length > 10000 ? line.toString().slice(0, 10000) : line.toString());
    }
  }).on('close', function () {
    historyCB && historyCB(_.takeRight(historyLogsArr, MAX_HISTORY_LEN));
    if (!wfs[projectName])
      listenLogs(projectName, newCB);
  });
}

function generateLog(str) {
  var regExp = /(\[.+?\])/g; //(\\[.+?\\])
  var res = str.match(regExp);
  // console.log(res);
  for (i = 0; i < res.length; i++) {
    res[i] = res[i].replace('[', '').replace(']', ''); //发送历史日志
  }
}

var listenLogs = function (projectName, newCB) {
  // console.log('日志监听中...');
  var fileOPFlag = "a+";
  fs.open(filePath, fileOPFlag, function (error, fd) {
    var buffer;
    wfs[projectName] = fs.watchFile(filePath, {
      persistent: false,
      interval: 1000
    }, function (curr, prev) {
      if (curr.size > prev.size) {
        //文件内容有变化，那么通知相应的进程可以执行相关操作。例如读物文件写入数据库等
        buffer = new Buffer(curr.size - prev.size);
        fs.read(fd, buffer, 0, (curr.size - prev.size), prev.size, function (err, bytesRead, buffer) {
          generateTxt(buffer.toString())
        });
      } else {
        // console.log('文件读取错误');
      }
    });

    // console.log(wfs)

    function generateTxt(str) { // 处理新增内容的地方

      str = str.replace(/\r/g, '');
      var temp = str.split('\n');
      temp = _.dropRight(temp, 1);
      newCB && newCB(temp);
    }
  });
};

function getNewLog(path) {
  // console.log('做一些解析操作');
}
