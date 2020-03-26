const _ = window.require('lodash');
const path = window.require('path');
const os = window.require('os')
const {PythonShell} = window.require('python-shell');
// const executor = window.require(path.resolve() + '/public/base_integration/uiauto_executor/executor.js');

// const params = {
//   'browsers':[
//     {
//        'command_executor_url': 'http://127.0.0.1:49797',
//        'session_id': 'a005a95b-c1f8-4073-aa21-efd98f987f43'
//     }
//   ]
// };

exports.start = function (params) {
  const promise = new Promise((resolve, reject) => {
      window['uiselector'].execute(params)
          .then((result) => {
              resolve(result);
          })
          .catch((err) => {
              reject(err);
          });

  });

  return promise
};

exports.openBrowser = (params) => {
  const promise = new Promise((resolve, reject) => {
    window['executor'].execute_python(path.normalize(path.resolve() + '/public/base_integration/uiauto_uiselector/open_browser.py'), 'main', params)
      .then((data) => {
        // window['uiselector'].remote_browser(data);
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });

  return promise;
};
