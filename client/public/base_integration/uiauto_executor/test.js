const shell = require('./js_shell');
const path = require('path');

const socket_client = shell.setup();

socket_client.emit('SHELL_INIT', null);

socket_client.on('SHELL_EXECUTE_RESULT', (data) => {
    console.log('SHELL_EXECUTE_RESULT', data);
});


/*shell.execute(socket_client, {
    js_path: path.resolve("C:\\uiauto-plugins\\terminal\\index.js"),
    method: 'executeFn',
    node: {
        "vB2948d5c": "",
        "type": "node",
        "shape": "flow-rect",
        "shapeType": "Convention",
        "size": "96 * 48",
        "label": "打印日志",
        "color": "#1890FF",
        "operation_id": "terminal-one",
        "plugin_id": "terminal",
        "input": [
            {
                "name": "必填属性",
                "id": "required_params",
                "properties": [
                    {
                        "id": "commandLine",
                        "name": "输出内容",
                        "type": "text",
                        "required": true,
                        "value": "1111111111"
                    }
                ]
            }
        ],
        "output": {},
        "version": "1.0.2",
        "x": 418.671875,
        "y": 249,
        "id": "d884e2b1",
        "index": 2,
        "general_property": [
            {
                "id": "retry_count",
                "value": "1",
                "name": "重试次数"
            },
            {
                "id": "retry_interval",
                "value": "50",
                "name": "重试时间间隔(ms)"
            },
            {
                "id": "execution_timeout",
                "value": "50000",
                "name": "执行超时时间(ms)"
            },
            {
                "id": "delayed_execution_time",
                "value": "50",
                "name": "延迟执行时间(ms)"
            },
            {
                "id": "waiting_time_after_execution",
                "value": "50",
                "name": "执行后等待时间"
            }
        ]
    },
    params: {
        "uiauto_config": {
            "project_name": "demo2"
        }
    }
});*/


