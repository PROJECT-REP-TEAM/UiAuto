const service = require('./task.service')
const utils = require('../../utils')
const path = window.require('path')
const { stop, views } = window.require(
    path.normalize(path.resolve() + "/public/runner/child_process_cache")
);
// const { execute } = window.require(
//     path.normalize(path.resolve() + "/public/base_integration/uiauto_executor/executor.js")
// );

export const executeTask = (req, res) => {
  const postBody = req.body;

  window['executor'].execute(postBody.projectName, postBody.params)
      .then(result => {
        console.log(result);
        res.json({
          isSuccess: true
        });
      })
      .catch(err => {
        res.json({
          isSuccess: true,
          error: err.stack
        });
      });

}

