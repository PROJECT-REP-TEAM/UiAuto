const WebSocket = window.nodeRequire('ws')

export function start_server() {
  const wss = new WebSocket.Server({
    port: 63380,
    perMessageDeflate: false
  })

  let pythonws = null

  wss.on('connection', (ws) => {
    console.log('websocket connect>>>>>>>>>>')
    ws.on('message', (message) => {
      console.log('message>>>>>>>', message)
      message = JSON.parse(message)
      if (message.client === 'browser') {
        console.log(window['pythonws'])
        if (pythonws) {
          pythonws.send(JSON.stringify(message.data))
        }
      }

      if (message.client === 'python') {
        pythonws = ws
      }
      console.log('received: %s', message)
    })
  })
}
