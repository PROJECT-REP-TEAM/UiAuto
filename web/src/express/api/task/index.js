const express = window.nodeRequire('express')
const controller = require('./task.controller')
const bodyParser = window.nodeRequire('body-parser')
const _router = express.Router()

_router.post('/execute', bodyParser.json(), controller.executeTask)

export const router = _router
