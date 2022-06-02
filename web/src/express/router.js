const express = window.nodeRequire('express')

const _router = express.Router()

_router.use('/common', require('./api/common').router)

_router.use('/task', require('./api/task').router)

export const router = _router
