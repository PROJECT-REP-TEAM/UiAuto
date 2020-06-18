import config from '@/config/environment/index'

const express = window.require('express')
const { router } = require('./router')
const socket = require('./socket/client')
const websocket = require('./socket/websockets')
const bodyParser = require('body-parser')

export function start_server() {
  const app = express()

  app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Accept-Ranges,DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,' +
      'If-Modified-Since,Cache-Control,Content-Type,Authorization,X-XSRF-TOKEN')
    res.header('Access-Control-Allow-Methods', 'POST,GET')
    next()
  })

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: false}))

  app.listen(config.express.port, '0.0.0.0', () => {
    console.info('服务启动监听地址：' + config.express.domain)
    console.info('服务启动监听端口：' + config.express.port)
  })

  app.use('/uiauto', router)

  // socket.start_socket_client()

  websocket.start_server()
}

