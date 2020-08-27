"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = __importStar(require("lodash"));
const path = __importStar(require("path"));
const server = require('http').createServer();
const io = window.require('socket.io')(server);
server.listen(63390);

const SocketClient = window.require('socket.io-client');
let global_data_store = {};
io.on('connection', client => {
    console.log('shell connection', client.id);
    client.on('SHELL_INIT', (data) => {
        console.log('SHELL_INIT>>>>>>>>>>>>', data);
        global_data_store = {};
    });

    client.on('SHELL_EXECUTE_SCRIPT', (data) => {
        const execute_result = {
            code: 0,
            data: null,
            errorMsg: null
        };
        try {
            const options = JSON.parse(data);
            const exec = require(path.join(path.resolve(), '/public/base_integration/uiauto_executor/temp/' + options.js_path));
            const $store = _.assignIn({}, global_data_store, options.$store);
            const output = generate_output_data(options.node);
            Promise.resolve(exec['script_node_executor']($store))
                .then((result) => {
                    console.log("SHELL_EXECUTE_SCRIPT>>>>>>", result);
                    if (!!output['is_allow_global_use'] && !!output['value']) {
                        global_data_store[output['value']] = !!result ? result : null;
                    }
                    execute_result.data = !!result ? result : null;
                    client.emit('SHELL_EXECUTE_RESULT', JSON.stringify(execute_result));
                })
                .catch((error) => {
                    execute_result.code = -1;
                    execute_result.errorMsg = handleError(error);
                    client.emit('SHELL_EXECUTE_RESULT', JSON.stringify(execute_result));
                });
        }
        catch (e) {
            execute_result.code = -1;
            execute_result.errorMsg = handleError(e);
            client.emit('SHELL_EXECUTE_RESULT', JSON.stringify(execute_result));
        }
    });
    client.on('SHELL_EXECUTE', (data) => {
        const execute_result = {
            code: 0,
            data: null,
            errorMsg: null
        };
        try {
            console.log(data);
            const options = JSON.parse(data);
            const exec = require(options.js_path);
            const exec_params = _.assignIn({}, generate_input_params(options.node), options.params);
            const output = generate_output_data(options.node);
            Promise.resolve(exec[options.method](exec_params))
                .then((result) => {
                    console.log("SHELL_EXECUTE>>>>>>", result);
                    if (!!output['is_allow_global_use'] && !!output['value']) {
                        global_data_store[output['value']] = !!result ? result : null;
                    }
                    execute_result.data = !!result ? result : null;
                    client.emit('SHELL_EXECUTE_RESULT', JSON.stringify(execute_result));
                })
                .catch((error) => {
                    execute_result.code = -1;
                    execute_result.errorMsg = handleError(error);
                    client.emit('SHELL_EXECUTE_RESULT', JSON.stringify(execute_result));
                });
        }
        catch (e) {
            execute_result.code = -1;
            execute_result.errorMsg = handleError(e);
            client.emit('SHELL_EXECUTE_RESULT', JSON.stringify(execute_result));
        }
    });
    client.on('disconnect', () => {
        console.log('disconnect>>>>>>>', client.id);
    });
});
const default_options = {
    port: 63390
};
function setup(options) {
    console.log("js shell setup");
    options = _.assignIn({}, default_options, options);
    server.listen(options.port);
    const socket_client = SocketClient("http://localhost:" + options.port);
    return socket_client;
}
exports.setup = setup;
function execute(socket_client, options) {
    socket_client.emit('SHELL_EXECUTE', JSON.stringify(options));
}
exports.execute = execute;
function destroy(socket_client) {
    socket_client.disconnect();
    io.close();
}
exports.destroy = destroy;
const handleError = (error) => {
    let result = null;
    if (_.isError(error)) {
        result = error.stack;
    }
    else {
        if (_.isString(error)) {
            result = error;
        }
        else {
            result = JSON.stringify(error);
        }
    }
    return result;
};
/**
 * TODO:
 * - 生成入参
 * @param {object} global_data_store
 * @param {object} node
 */
const generate_input_params = (node) => {
    let params = {};
    try {
        if (typeof node.input !== "undefined" && node.input !== null && node.input !== "") {
            const inputs = node.input;
            if (typeof inputs !== 'undefined' && inputs !== null) {
                _.forEach(inputs, (input) => {
                    _.forEach(input.properties, (property) => {
                        if (typeof property.value !== 'undefined' && property.value !== null) {
                            params = _.assignIn(params, analytical_expression(property, global_data_store));
                        }
                    });
                });
            }
            else {
                throw new Error('json parse error');
            }
        }
    }
    catch (e) {
        throw e;
    }
    return params;
};
const analytical_expression = (property, global_data) => {
    let result = {};
    const keys = _.keys(global_data);
    const values = _.values(global_data);
    if (!!property.value) {
        if (_.isArray(property.value)) {
            result[property.id] = [];
            _.forEach(property.value, (value) => {
                result[property.id].push(analytical_expression({
                    id: property.id,
                    value: value
                }, global_data)[property.id]);
            });
        }
        else {
            if (_.isString(property.value)) {
                const value_match = property.value.match(/\${(.*)}/g);
                let temp_value = property.value;
                if (!!value_match && value_match.length === 1) {
                    const value = value_match[0];
                    let field = value.replace(/\${|[}]$/g, "");
                    const javascript_math = field.match(/@\s*js/g);
                    if (!!javascript_math && javascript_math.length > 0) {
                        _.forEach(javascript_math, (js_match) => {
                            field = field.replace(js_match, '');
                        });
                        const fun = new Function(keys, "return typeof " + field + " !== 'undefined' ? " + field + " : null");
                        temp_value = fun(...values);
                        if (property.value.length === value.length) {
                            result[property.id] = temp_value;
                        }
                        else {
                            result[property.id] = property.value.replace(eval("/" + value + "/g"), JSON.stringify(temp_value));
                        }
                    }
                }
                else {
                    if (!!value_match && value_match.length >= 1) {
                        _.forEach(value_match, (value) => {
                            let field = value.replace(/\${|[}]$/g, "");
                            const javascript_math = field.match(/@\s*js/g);
                            if (!!javascript_math && javascript_math.length > 0) {
                                _.forEach(javascript_math, (js_match) => {
                                    field = field.replace(js_match, '');
                                });
                                const fun = new Function(keys, "return typeof " + field + " !== 'undefined' ? " + field + " : null");
                                const field_value = fun(...values);
                                temp_value = temp_value.replace(eval("/" + value + "/g"), JSON.stringify(field_value));
                            }
                        });
                        result[property.id] = temp_value;
                    }
                    else {
                        result[property.id] = property.value;
                    }
                }
            }
            else {
                if (_.isObject(property.value)) {
                    result[property.id] = {};
                    const obj_keys = _.keys(property.value);
                    _.forEach(obj_keys, (key) => {
                        result[property.id][key] = analytical_expression({
                            id: key,
                            value: property.value[key]
                        }, global_data)[key];
                    });
                }
                else {
                    result[property.id] = property.value;
                }
            }
        }
    }
    else {
        result[property.id] = "";
    }
    return result;
};
/**
 * 生成出参对象
 * @param {object} node
 */
const generate_output_data = (node) => {
    let result = {};
    try {
        if (typeof node.output !== 'undefined' && node.output !== null && node.output !== "") {
            result = node.output;
        }
        else {
            result = {
                is_allow_global_use: false,
                value: ''
            };
        }
    }
    catch (e) {
        throw e;
    }
    return result;
};
