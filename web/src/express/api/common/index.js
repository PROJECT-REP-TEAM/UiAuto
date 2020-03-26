const express = window.require('express')
const controller = require('./common.controller')
const _router = express.Router()

_router.get('/get_device_id', controller.getDeviceId)
_router.get('/uiselector/static_assets/:file_path', controller.getUiSelectorStaticAssets)

export const router = _router
