const service = require('./common.service')
const utils = require('../../utils')

export const getDeviceId = (req, res) => {
  service.doGetDeviceId()
    .then((result) => {
      utils.formatResult(null, result, res)
    })
    .catch((e) => {
      utils.formatResult(e, null, res)
    })
}

export const getUiSelectorStaticAssets = (req, res) => {
  service.doGetUiSelectorStaticAssets(req, res)
}

