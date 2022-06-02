const ws = require('ws')


exports.start_process = () => {
    console.log('start ui selector websocket')
    window['wss'] = new ws.WebSocketServer({
        port: 63360,
        perMessageDeflate: {
            zlibDeflateOptions: {
                // See zlib defaults.
                chunkSize: 1024,
                memLevel: 7,
                level: 3
            },
            zlibInflateOptions: {
                chunkSize: 10 * 1024
            },
            // Other options settable:
            clientNoContextTakeover: true, // Defaults to negotiated value.
            serverNoContextTakeover: true, // Defaults to negotiated value.
            serverMaxWindowBits: 10, // Defaults to negotiated value.
            // Below options specified as default values.
            concurrencyLimit: 10, // Limits zlib concurrency for perf.
            threshold: 1024 // Size (in bytes) below which messages
            // should not be compressed if context takeover is disabled.
        }
    });

    window['wss'].on('connection', function connection(ws) {
        console.log('chrome ui selector online')
    });

    console.log("wss>>>>>>>>", window['wss'])
};

exports.execute = (params) => {
    console.log('uiselector execute')
    return new Promise((resolve, reject) => {
        try {
            if (!!window['wss']) {
                window['wss'].clients.forEach(client => {
                    console.log(client)
                    client.on('message', function (msg) {
                        msg = JSON.parse(msg)
                        if (msg.event !== "CHECK") {
                            if (msg.event === "UI") {
                                console.log('client message:', msg)
                                resolve(msg.data)
                            } else {
                                reject("error")
                            }

                            window['wss'].clients.forEach(client => {
                                client.send(JSON.stringify({
                                    event: "STOP"
                                }))
                            })
                        }
                    })
                    client.send(JSON.stringify({
                        event: "START"
                    }))
                })
            } else {
                reject('选择器没有启动')
            }
        } catch (e) {
            reject(e)
        }

    });

};

exports.restart_process = () => {
    console.log("重启UI选择器");
};

exports.exit_uiselector = () => {
    window['uiselector_shell'].stdin.write("close_chrome\n");
    window['uiselector_shell'].kill();
};

