"use strict";

const _ = require("lodash");
const moment = require("moment");
const fs = require("fs");
const fse = require('fs-extra');

const getStackTrace = () => {
    const obj = {};
    Error.captureStackTrace(obj, getStackTrace);
    return obj.stack;
};

/**
 * TODO:
 * - 获取输出日志的代码文件及行数
 */
const getConsoleLine = (stack) => {
    stack = stack
        .split('at ')[2]
        .replace(/\n/, "")
        .replace(/\(/g, '-')
        .replace(/\)/g, '-')
        .replace(/ /g, "")
        .split('-');
    stack = _.filter(stack, (data) => {
        return data !== "";
    });

    return stack[stack.length - 1];
};

const log_path = "C:\\logs\\electron-log.txt";
if (!fs.existsSync("C:\\logs")) {
    fse.ensureDirSync("C:\\logs");
}

exports.init = () => {

    console.log = ((oriLogFunc) => {
        return (...args) => {
            const tag = 'log';
            const line = getConsoleLine(getStackTrace());

            const log_flag = line + ' >>> ' + moment().format('YYYY-MM-DD HH:mm:ss+SSS') +
                ' >>> [' + tag + ']:';
            oriLogFunc.call(console, log_flag, ...args);

            appendFile(log_path, log_flag, ...args);

        }
    })(console.log);

    console.info = ((oriLogFunc) => {
        return (...args) => {

            const line = getConsoleLine(getStackTrace());
            const log_flag = line + ' >>> ' + moment().format('YYYY-MM-DD HH:mm:ss+SSS') +
                ' >>> [info]:';
            oriLogFunc.call(console, log_flag, ...args);

            appendFile(log_path, log_flag, ...args);

        }
    })(console.info);

    console.error = ((oriLogFunc) => {
        return (...args) => {

            const line = getConsoleLine(getStackTrace());
            const log_flag = line + ' >>> ' + moment().format('YYYY-MM-DD HH:mm:ss+SSS') +
                ' >>> [error]:';
            oriLogFunc.call(console, log_flag, ...args);

            appendFile(log_path, log_flag, ...args);

        }
    })(console.error);

    console.debug = ((oriLogFunc) => {
        return (...args) => {

            const line = getConsoleLine(getStackTrace());
            const log_flag = line + ' >>> ' + moment().format('YYYY-MM-DD HH:mm:ss+SSS') +
                ' >>> [debug]:';
            oriLogFunc.call(console, log_flag, ...args);

            appendFile(log_path, log_flag, ...args);

        }
    })(console.debug);

    console.warn = ((oriLogFunc) => {
        return (...args) => {

            const line = getConsoleLine(getStackTrace());
            const log_flag = line + ' >>> ' + moment().format('YYYY-MM-DD HH:mm:ss+SSS') +
                ' >>> [warn]:';
            oriLogFunc.call(console, log_flag, ...args);

            appendFile(log_path, log_flag, ...args);

        }
    })(console.warn);

};

let appendFile = function (log_path, log_flag, ...args) {
    try {
        const log_str = log_flag +
            JSON.stringify(args).replace(/^\[+/g, "").replace(/\]+$/g, "") + "\r\n";
        fs.appendFileSync(log_path, log_str);
    } catch (e) {

    }
};
