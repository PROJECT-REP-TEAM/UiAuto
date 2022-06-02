const service = require('./task.service')
const utils = require('../../utils')
const path = window.nodeRequire('path')

export const executeTask = (req, res) => {
  const postBody = req.body

  window["executor"].execute(postBody.projectName, postBody.params)
    .then(result => {
      console.log(result)
      res.json({
        isSuccess: true
      })
    })
    .catch(err => {
      res.json({
        isSuccess: true,
        error: err.stack
      })
    })
}

