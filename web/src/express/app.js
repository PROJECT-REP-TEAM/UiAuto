import config from '@/config/environment/index'

const express = window.nodeRequire('express')
const { router } = require('./router')
const socket = require('./socket/client')
const websocket = require('./socket/websockets')
const bodyParser = require('body-parser')
const http = window.nodeRequire('http')
const io = window.nodeRequire('socket.io')

export function start_server() {
  const app = express()

  app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Accept-Ranges,DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,' +
      'If-Modified-Since,Cache-Control,Content-Type,Authorization,X-XSRF-TOKEN')
    res.header('Access-Control-Allow-Methods', 'POST,GET')
    next()
  })

  app.use(bodyParser.json({ limit: '100mb' }))
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use('/uiauto', router)
  const server = http.createServer(app)
  const io = window.nodeRequire('socket.io')(server)
  io.on('connection', client => {
    console.log('执行器与外壳的socket连接成功')
    client.on('send_log', (data, callback) => {
      const socket_client = socket.getSocketClient()
      socket_client.emit('UIAUTO_SAVE_LOG', data, (message) => {
        console.log('日志保存回调：' + message)
        callback(message)
      })
    })
  })
  server.listen(config.express.port, '127.0.0.1', () => {
    console.info('服务启动监听地址：' + config.express.domain)
    console.info('服务启动监听端口：' + config.express.port)
  })

  // socket.start_socket_client()

  websocket.start_server()
}

