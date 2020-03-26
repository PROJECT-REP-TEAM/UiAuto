from queue import LifoQueue
from execute_result import ExecuteResult
from global_variable import GlobalVariable
from urllib.parse import unquote
import jpype
import copy
import eventlet
import asyncio
import traceback
import socketio
import execjs
import importlib
import re
import ctypes
import inspect
import time
import multiprocessing
import threading
import sys
import os
import io
import json
sys.path.insert(0, os.path.split(os.path.realpath(__file__))[0] + "\\base")
# sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

sio = socketio.Client()


@sio.event
def connect():
    # print('connection established')
    pass


@sio.event
def disconnect():
    # print('disconnected from server')
    pass


global_data_store = {
    "browser": 1
}

date_format = "%Y-%m-%d %H:%M:%S"

execute_failed_nodes = []


class NodeExecuteTimoutError(Exception):

    def __init__(self):
        Exception.__init__(self, '执行超时')


class NodeException(Exception):
    def __init__(self, node, error):
        error_msg = '节点【%s】执行出错：%s' % (node['label'], error)
        print('%s [error] - %s' % (time.strftime(date_format,
                                                 time.localtime(int(time.time()))), error_msg))
        Exception.__init__(self, error_msg)


# 节点执行类
class ExecuteNode:

    project_config = None
    plugins_dir = None
    options = {}

    def __init__(self, project_config, plugins_dir, options):
        self.plugins_dir = plugins_dir
        self.project_config = project_config
        self.options = options

    def Start(self, current_node):
        execute_result = True
        return execute_result

    def Condition(self, current_node):
        try:
            execute_result = {}
            node_params = self.generate_node_params(current_node)
            if node_params['conditions'] is None or node_params['conditions'] == "" or len(node_params['conditions']) == 0:
                raise Exception('参数缺失')
            else:
                for condition in node_params['conditions']:
                    if type(condition['expression']) is str:
                        execute_result[str(condition['name'])] = eval(
                            condition['expression'])
                    else:
                        execute_result[str(condition['name'])] = (
                            True if condition['expression'] else False)

            return execute_result
        except Exception:
            raise NodeException(
                node=current_node, error=traceback.format_exc().replace('\n', ' '))

    def Circulation(self, current_node):
        try:
            execute_result = None
            node_params = self.generate_node_params(current_node)
            node_output = generate_output_data(current_node)

            if node_params['array'] is None or node_params['array'] == "":
                raise Exception('参数缺失')
            else:
                next_nodes = []
                next_lines = find_next_lines(
                    edges=self.project_config['edges'], source_node=current_node)
                for next_line in next_lines:
                    if next_line['sourceAnchor'] == 1 or next_line['sourceAnchor'] == 3:
                        next_node = find_node(
                            nodes=self.project_config['nodes'], id=next_line['target'])
                        next_nodes.append(next_node)
                if next_nodes is not None and len(next_nodes) > 0:
                    print('%s - 节点【%s】支路执行开始' % (time.strftime(date_format,
                                                               time.localtime(int(time.time()))), current_node['label']))
                    self.options['is_branch'] = True 
                    self.options['trunk_node'] = current_node
                    for item in node_params['array']:
                        if 'value' in node_output.keys() and node_output['value'] is not None and \
                                node_output['value'] != '':
                            global_data_store[node_output['value']] = item
                        for next_node in next_nodes:
                            execute(project_config=self.project_config,
                                    current_node=next_node, options=self.options)
                    print('%s - 节点【%s】支路执行完成' % (time.strftime(date_format,
                                                               time.localtime(int(time.time()))), current_node['label']))
                else:
                    print('%s - 节点【%s】没有支路' % (time.strftime(date_format,
                                                             time.localtime(int(time.time()))), current_node['label']))

            self.options['is_branch'] = False
            self.options['trunk_node'] = None
            return execute_result

        except Exception:
            raise NodeException(
                node=current_node, error=traceback.format_exc().replace('\n', ' '))

    def Convention(self, current_node):
        try:
            execute_result = None
            node_params = self.generate_node_params(current_node)
            node_output = generate_output_data(current_node)
            node_plugin = find_plugin_for_node(
                node=current_node, plugins_dir=self.plugins_dir)
            node_operation = find_operation_for_node(
                plugin=node_plugin, node=current_node)
            plugin_dir = self.plugins_dir + "\\" + node_plugin['id']
            exec_name = 'index'
            if node_plugin['language'] == 'python':
                execute_result = self.execute_python(params=node_params, options={
                    'py_dir': plugin_dir,
                    'py_name': exec_name,
                    'method': node_operation['method']
                })
            elif node_plugin['language'] == 'nodejs':
                execute_result = self.execute_nodejs(options={
                    'js_path': plugin_dir + "\\" + exec_name + ".js",
                    'method': node_operation['method'],
                    'node': current_node,
                    'params': node_params
                })
            elif node_plugin['language'] == 'java':
                process_queue = multiprocessing.Queue()
                process = multiprocessing.Process(target=self.execute_java, args=(process_queue, node_params, {
                    'executor_dir': self.options['executor_dir'],
                    'plugin_dir': plugin_dir,
                    'main': node_plugin['main'],
                    'jar': node_plugin['jar'],
                    'method': node_operation['method']
                }))
                process.daemon = True
                process.start()
                execute_result = process_queue.get()
                process.terminate()
                # execute_result = self.execute_java(params=node_params, options={
                #     'executor_dir': self.options['executor_dir'],
                #     'plugin_dir': plugin_dir,
                #     'main': node_plugin['main'],
                #     'jar': node_plugin['jar'],
                #     'method': node_operation['method']
                # })
            else:
                raise Exception('当前插件语言尚未支持')

            if 'is_allow_global_use' in node_output.keys() and node_output['is_allow_global_use'] == True and \
                    'value' in node_output.keys() and node_output['value'] is not None and node_output['value'] != '':
                global_data_store[node_output['value']] = execute_result

            return execute_result
        except Exception:
            raise NodeException(
                node=current_node, error=traceback.format_exc().replace('\n', ' '))

    def Script(self, current_node):
        try:
            execute_result = None
            node_params = self.generate_node_params(current_node)
            node_output = generate_output_data(current_node)
            node_plugin = find_plugin_for_node(
                node=current_node, plugins_dir=self.plugins_dir)
            if 'code' in node_params and node_params['code'] is not None and node_params['code'] != '':
                if node_plugin['language'] == 'python':
                    with open('%s\\script_node_py_template.py' % self.options['executor_dir'], 'r', encoding='UTF-8') as template_file:
                        template_code = template_file.read()
                    node_params['code'] = node_params['code'].replace(
                        "\n", "\n    ")
                    template_code = template_code.replace(
                        '#execute_code', node_params['code'])
                    temp_dir = self.options['executor_dir'] + '\\temp\\'
                    temp_file_name = 'py_script_%s_%s_%s' % (current_node['label'], current_node['id'],
                                                             time.strftime('%Y%m%d%H%M%S', time.localtime(int(time.time()))))
                    temp_file_path = temp_dir + temp_file_name + '.py'
                    with open(temp_file_path, 'w', encoding='UTF-8') as template_file:
                        template_file.write(template_code)

                    sys.path.insert(0, temp_dir)
                    execute_result = getattr(__import__(
                        temp_file_name), 'script_node_executor')(global_data_store)
                    sys.path.remove(temp_dir)
                    os.remove(temp_file_path)

                elif node_plugin['language'] == 'nodejs':
                    with open('%s\\script_node_js_template.js' % self.options['executor_dir'], 'r', encoding='UTF-8') as template_file:
                        template_code = template_file.read()
                    node_params['code'] = node_params['code'].replace(
                        "\n", "\n    ")
                    template_code = template_code.replace(
                        '// execute_code', node_params['code'])
                    temp_dir = self.options['executor_dir'] + '\\temp\\'
                    temp_file_name = 'js_script_%s_%s_%s' % (current_node['label'], current_node['id'],
                                                             time.strftime('%Y%m%d%H%M%S', time.localtime(int(time.time()))))
                    temp_file_path = temp_dir + temp_file_name + '.js'
                    with open(temp_file_path, 'w', encoding='UTF-8') as template_file:
                        template_file.write(template_code)

                    if sio.connected == False:
                        # 连接socket.io
                        sio.connect('http://localhost:63390')

                    self.execute_result = None

                    def handle_nodejs_result(data):
                        self.execute_result = json.loads(data)
                        sio.disconnect()

                    sio.on('SHELL_EXECUTE_RESULT', handle_nodejs_result)

                    print(temp_file_path)
                    sio.emit('SHELL_EXECUTE_SCRIPT', json.dumps({
                        'js_path': temp_file_name,
                        '$store': global_data_store,
                        'node': current_node
                    }))

                    sio.wait()

                    # os.remove(temp_file_path)
                    if self.execute_result['code'] == -1:
                        raise Exception(self.execute_result['errorMsg'])
                    else:
                        self.execute_result = self.execute_result['data']
                    return self.execute_result
                else:
                    raise Exception('当前插件语言尚未支持')
            else:
                pass

            if 'is_allow_global_use' in node_output.keys() and node_output['is_allow_global_use'] == True and \
                    node_output['value'] is not None and node_output['value'] != '':
                global_data_store[node_output['value']] = execute_result

            return execute_result
        except Exception:
            raise NodeException(
                node=current_node, error=traceback.format_exc().replace('\n', ' '))

    def Abnormal(self, current_node):
        try:
            node_params = self.generate_node_params(current_node)
            execute_result = node_params['kill_task']

            """ next_lines = find_next_lines(edges=self.project_config['edges'], source_node=current_node)

            if next_lines is not None and len(next_lines) > 0:
                self.options['is_branch'] = True
                self.options['trunk_node'] = current_node
                for next_line in next_lines:
                    next_node = find_node(nodes=self.project_config['nodes'], id=next_line['target'])
                    execute(project_config=self.project_config, current_node=next_node, options=self.options)
                self.options['is_branch'] = True
                self.options['trunk_node'] = current_node """

            return execute_result
        except Exception:
            raise NodeException(
                node=current_node, error=traceback.format_exc().replace('\n', ' '))

    def Wait(self, current_node):
        try:
            execute_result = None
            return execute_result
        except Exception:
            raise NodeException(
                node=current_node, error=traceback.format_exc().replace('\n', ' '))

    def Subprocess(self, current_node):
        try:
            global global_data_store
            execute_result = None
            node_params = self.generate_node_params(current_node)

            node_output = generate_output_data(current_node)
            if self.options['params'] is None:
                self.options['params'] = {}
            self.options['params'].update(global_data_store)

            if node_params['participation'] != "" and node_params['participation'] is not None:
                self.options['params'].update(node_params['participation'])

            print('%s - 子流程【%s】执行开始' % (time.strftime(date_format,
                                                      time.localtime(int(time.time()))), node_params['project_name']))
            project_path = self.options['projects_dir'] + '\\' + \
                node_params['project_name'] + '\\' + \
                node_params['project_name'] + '.json'
            # process_queue = multiprocessing.Queue()
            # process = multiprocessing.Process(target=running, args=(project_path, self.options, process_queue))
            # process.start()
            # process.join()
            # process.terminate()
            # print(">>>>>>>>>>>", process_queue.qsize())
            # execute_result = process_queue.get()
            # global_data_store.update(execute_result.global_data)
            execute_result = running(
                project_path=project_path, options=self.options)

            if 'is_allow_global_use' in node_output.keys() and node_output['is_allow_global_use'] == True and \
                    node_output['value'] is not None and node_output['value'] != '':
                global_data_store[node_output['value']] = execute_result
                print("Subprocess>>>>>>>>>",
                      global_data_store[node_output['value']].to_string())
            if execute_result.success is True:
                print('%s - 子流程【%s】执行完成' % (time.strftime(date_format,
                                                          time.localtime(int(time.time()))), node_params['project_name']))
            else:
                print('%s - 子流程【%s】执行出错' % (time.strftime(date_format,
                                                          time.localtime(int(time.time()))), node_params['project_name']))
                raise Exception("子流程%s执行出错" % node_params['project_name'])
            return execute_result
        except Exception:
            raise NodeException(
                node=current_node, error=traceback.format_exc().replace('\n', ' '))

    def End(self, current_node):
        execute_result = True
        return execute_result

    def execute_python(self, params, options):
        sys.path.insert(0, options['py_dir'])
        user_site_packages_path = options['py_dir'] + '\\site-packages'
        sys.path.insert(1, user_site_packages_path)
        metaclass = importlib.import_module(options['py_name'])
        if options['py_name'] in sys.modules.keys():
            importlib.reload(metaclass)
        result = getattr(metaclass, options['method'])(params)
        sys.path.remove(options['py_dir'])
        sys.path.remove(user_site_packages_path)
        return result

    def execute_nodejs(self, options):
        if sio.connected == False:
            # 连接socket.io
            sio.connect('http://localhost:63390')

        self.execute_result = None

        def handle_nodejs_result(data):
            self.execute_result = json.loads(data)
            sio.disconnect()

        sio.on('SHELL_EXECUTE_RESULT', handle_nodejs_result)

        sio.emit('SHELL_EXECUTE', json.dumps(options))

        sio.wait()
        if self.execute_result is not None:
            if self.execute_result['code'] == -1:
                raise Exception(self.execute_result['errorMsg'])
            else:
                self.execute_result = self.execute_result['data']
        return self.execute_result

    def execute_java(self, process_queue, params, options):
        try:
            jvm_path = options['client_dir'] + \
                "\\env\\jre\\bin\\client\\jvm.dll"
            jar_path = options['plugin_dir'] + "\\" + options['jar']
            jpype.startJVM(jvm_path, "-ea",
                           "-Djava.class.path=%s" % (jar_path))
            MapClass = jpype.JClass("java.util.HashMap")
            params_map = MapClass()
            for key in params.keys():
                if isinstance(params[key], str):
                    params_map.put(key, params[key])
            JDClass = jpype.JClass(options['main'])
            java_instance = JDClass()
            result = getattr(java_instance, options['method'])(params_map)
            jpype.shutdownJVM()
            process_queue.put(result)
            # return result
        except Exception as e:
            if jpype.isJVMStarted() is True:
                jpype.shutdownJVM()
            raise e

    # 解析参数表达式
    def analytical_expression(self, input_property, global_data):
        result = {}
        if input_property['value'] is not None and input_property['value'] != "":
            if type(input_property['value']) is list:
                result[input_property['id']] = []
                for input_value in input_property['value']:
                    result[input_property['id']].append(self.analytical_expression(input_property={
                        "id": input_property['id'],
                        "value": input_value
                    }, global_data=global_data)[input_property['id']])
            elif type(input_property['value']) is str:
                match_values = re.findall(
                    r'\${(.*?)}', input_property['value'])
                if len(match_values) == 1:
                    match_value = match_values[0]
                    # 检索@js表达式标记
                    javasript_match = re.findall(r'@\s??js', match_value)
                    if len(javasript_match) == 0:
                        # 检索@py表达式标记
                        python_match = re.findall(r'@\s??py', match_value)
                        for py_match in python_match:
                            match_value = match_value.replace(py_match, '')
                            input_property['value'] = input_property['value'].replace(
                                py_match, '')
                        scope = eval(match_value, global_data)
                        if len(input_property['value']) == len('${%s}' % match_value):
                            result[input_property['id']] = scope
                        else:
                            result[input_property['id']] = input_property['value'].replace(
                                '${%s}' % match_value, str(scope))
                elif len(match_values) > 1:
                    for match_value in match_values:
                        # 检索@js表达式标记
                        javasript_match = re.findall(r'@\s??js', match_value)
                        if len(javasript_match) == 0:
                            # 检索@py表达式标记
                            python_match = re.findall(r'@\s??py', match_value)
                            for py_match in python_match:
                                match_value = match_value.replace(py_match, '')
                                input_property['value'] = input_property['value'].replace(
                                    py_match, '')
                            scope = eval(match_value, global_data)
                            input_property['value'] = input_property['value'].replace(
                                '${%s}' % match_value, str(scope))
                    result[input_property['id']] = input_property['value']
                else:
                    result[input_property['id']] = input_property['value']
            elif type(input_property['value']) is dict:
                result[input_property['id']] = {}
                keys = input_property['value'].keys()
                for key in keys:
                    result[input_property['id']][key] = self.analytical_expression(input_property={
                        "id": key,
                        "value": input_property['value'][key]
                    }, global_data=global_data)[key]
            else:
                result[input_property['id']] = input_property['value']
        else:
            result[input_property['id']] = input_property['value']
        return result

    # 生成节点参数
    def generate_node_params(self, node):
        branch_flag = ('节点【%s】的支路' % self.options['trunk_node']['label'] if 'is_branch' in self.options.keys(
        ) and self.options['is_branch'] == True else '')
        node_params = {}
        for node_input in node['input']:
            for input_property in node_input['properties']:
                global_data = {}
                global_data.update(global_data_store)
                node_params.update(self.analytical_expression(
                    input_property=input_property, global_data=global_data))

        print('%s - %s节点【%s】参数：' % (time.strftime(date_format,
                                                  time.localtime(int(time.time()))), branch_flag, node['label']), node_params)
        node_params['uiauto_config'] = self.options

        # print('%s - %s节点【%s】参数：' % (time.strftime(date_format, time.localtime(int(time.time()))), branch_flag, node['label']), node_params)

        return node_params


def _async_raise(tid, exctype):
    """raises the exception, performs cleanup if needed"""
    tid = ctypes.c_long(tid)
    if not inspect.isclass(exctype):
        exctype = type(exctype)
    res = ctypes.pythonapi.PyThreadState_SetAsyncExc(
        tid, ctypes.py_object(exctype))
    if res == 0:
        raise ValueError("invalid thread id")
    elif res != 1:
        # """if it returns a number greater than one, you're in trouble,
        # and you should call it again with exc=NULL to revert the effect"""
        ctypes.pythonapi.PyThreadState_SetAsyncExc(tid, None)
        raise SystemError("PyThreadState_SetAsyncExc failed")


def stop_thread(thread):
    _async_raise(thread.ident, SystemExit)


# 生成插件输出配置
def generate_output_data(node):
    output = {}
    if 'output' in node.keys():
        output = node['output']
    return output


# 生成插件的通用属性
def generate_general_property(node):
    result = {}
    if "general_property" not in node.keys():
        raise Exception('插件没有通用属性配置')
    else:
        general_property = (node['general_property']
                            if node['general_property'] is not None else [])
        for gp in general_property:
            result[gp['id']] = gp['value']

    return result


# 查找当前节点对应的插件
def find_plugin_for_node(node, plugins_dir):
    plugin = None
    plugin_path = plugins_dir + "\\" + node['plugin_id'] + "\\package.json"
    if os.path.exists(plugin_path):
        with open(plugin_path, 'r', encoding='UTF-8') as plugin_file:
            plugin = json.loads(plugin_file.read())
    else:
        raise Exception('当前节点的插件不存在')

    return plugin


# 查找当前节点对应的插件操作
def find_operation_for_node(plugin, node):
    exec_operation = None
    if 'uiauto_config' not in plugin.keys():
        raise Exception('插件配置不正确')
    else:
        operations = (plugin['uiauto_config']['operations']
                      if plugin['uiauto_config']['operations'] is not None else [])
        for operation in operations:
            if operation['operation_id'] == node['operation_id']:
                exec_operation = operation

    if exec_operation is None:
        raise Exception('插件配置中没有找到与当前节点对应的操作')

    return exec_operation


# 查找开始节点
def find_first_node(nodes):
    start_node = None
    for node in nodes:
        if node['shapeType'] == 'Start':
            start_node = node
    return start_node


# 查找结束节点
def find_end_node(nodes):
    end_node = None
    for node in nodes:
        if node['shapeType'] == 'End':
            end_node = node
    return end_node


# 查找下一节点的线路
def find_next_lines(edges, source_node):
    next_lines = []
    if source_node is None:
        raise Exception('查找下一步线路时，源节点不存在')
    else:
        for edge in edges:
            if edge['source'] == source_node['id']:
                next_lines.append(edge)
    return next_lines


# 查找上一节点的线路
def find_prev_lines(edges, target_node):
    prev_lines = []
    if target_node is None:
        raise Exception('查找上一步线路时，目标节点不存在')
    else:
        for edge in edges:
            if edge['target'] == target_node['id']:
                prev_lines.append(edge)
    return prev_lines


# 根据ID查找节点
def find_node(nodes, id):
    targe_node = None
    for node in nodes:
        if node['id'] == id:
            targe_node = node
    return targe_node


# 查找等待节点
def find_wait_node(nodes, next_lines):
    wait_nodes = []
    for next_line in next_lines:
        node = find_node(nodes=nodes, id=next_line['target'])
        if node is not None and node['shapeType'] == 'Wait':
            wait_nodes.append(node)

    return wait_nodes


# 日志输出
def print_log(branch_flag, current_node, content):
    print('%s - %s节点【%s】%s' %
          (time.strftime(date_format, time.localtime(int(time.time()))), branch_flag, current_node['label'], content))


# 执行流程
def execute(project_config, current_node, options):
    execute_result = None
    branch_flag = ('节点【%s】的支路' % options['trunk_node']['label']
                   if 'is_branch' in options.keys() and options['is_branch'] == True
                   else '')

    print_log(branch_flag=branch_flag,
              current_node=current_node, content="开始执行")

    general_property = generate_general_property(current_node)
    next_lines = find_next_lines(
        edges=project_config['edges'], source_node=current_node)

    if 'delayed_execution_time' in general_property.keys() and int(general_property['delayed_execution_time']) > 0:
        delayed_execution_time = int(
            general_property['delayed_execution_time']) / 1000
        print('%s - %s节点【%s】延时执行：%f秒' % (time.strftime(date_format, time.localtime(
            int(time.time()))), branch_flag, current_node['label'], delayed_execution_time))
        time.sleep(delayed_execution_time)

    try:

        if 'execution_timeout' in general_property.keys() and int(general_property['execution_timeout']) > 0:
            execution_timeout = int(
                general_property['execution_timeout']) / 1000
            print('%s - %s节点【%s】延时执行：%f秒' % (time.strftime(date_format, time.localtime(
                int(time.time()))), branch_flag, current_node['label'], delayed_execution_time))
            is_timeout = True
            with eventlet.Timeout(execution_timeout, False):
                execute_node = ExecuteNode(
                    plugins_dir=options['plugins_dir'], project_config=project_config, options=options)
                execute_result = getattr(execute_node, current_node['shapeType'])(
                    current_node=current_node)
                is_timeout = False

                if 'waiting_time_after_execution' in general_property.keys() and int(general_property['waiting_time_after_execution']) > 0:
                    waiting_time_after_execution = int(
                        general_property['waiting_time_after_execution']) / 1000
                    print('%s - %s节点【%s】执行后等待：%f秒' % (time.strftime(date_format, time.localtime(int(
                        time.time()))), branch_flag, current_node['label'], waiting_time_after_execution))
                    time.sleep(waiting_time_after_execution)

            if is_timeout == True:
                raise Exception('执行超时')
        else:
            execute_node = ExecuteNode(
                plugins_dir=options['plugins_dir'], project_config=project_config, options=options)
            execute_result = getattr(execute_node, current_node['shapeType'])(
                current_node=current_node)

        print('%s - %s节点【%s】执行完成，返回结果：' % (time.strftime(date_format, time.localtime(
            int(time.time()))), branch_flag, current_node['label']), execute_result)

    except Exception as e:
        if 'retry_count' in general_property.keys() and int(general_property['retry_count']) > 0:
            retry_count = 0
            error_list = []
            for i in range(0, int(general_property['retry_count'])):
                try:
                    print('%s - %s节点【%s】执行出错后第 %d 次重试，开始执行' % (time.strftime(date_format,
                                                                             time.localtime(int(time.time()))), branch_flag, current_node['label'], (i + 1)))
                    if 'retry_interval' in general_property.keys() and int(general_property['retry_interval']) > 0:
                        retry_interval = int(
                            general_property['retry_interval']) / 1000
                        print('%s - %s节点【%s】执行出错后重试间隔：%f秒' % (time.strftime(date_format, time.localtime(
                            int(time.time()))), branch_flag, current_node['label'], retry_interval))
                        time.sleep(retry_interval)

                        if 'execution_timeout' in general_property.keys() and int(general_property['execution_timeout']) > 0:
                            execution_timeout = int(
                                general_property['execution_timeout']) / 1000
                            print('%s - %s节点【%s】延时执行：%f秒' % (time.strftime(date_format, time.localtime(
                                int(time.time()))), branch_flag, current_node['label'], delayed_execution_time))
                            is_timeout = True
                            with eventlet.Timeout(execution_timeout, False):
                                execute_node = ExecuteNode(
                                    plugins_dir=options['plugins_dir'], project_config=project_config, options=options)
                                execute_result = getattr(execute_node, current_node['shapeType'])(
                                    current_node=current_node)
                                is_timeout = False

                                if 'waiting_time_after_execution' in general_property.keys() and int(general_property['waiting_time_after_execution']) > 0:
                                    waiting_time_after_execution = int(
                                        general_property['waiting_time_after_execution']) / 1000
                                    print('%s - %s节点【%s】执行后等待：%f秒' % (time.strftime(date_format, time.localtime(int(
                                        time.time()))), branch_flag, current_node['label'], waiting_time_after_execution))
                                    time.sleep(waiting_time_after_execution)

                            if is_timeout == True:
                                raise Exception('执行超时')
                        else:
                            execute_node = ExecuteNode(
                                plugins_dir=options['plugins_dir'], project_config=project_config, options=options)
                            execute_result = getattr(execute_node, current_node['shapeType'])(
                                current_node=current_node)

                        print('%s - %s节点【%s】执行出错后第 %d 次重试，执行成功' % (time.strftime(date_format, time.localtime(
                            int(time.time()))), branch_flag, current_node['label'], (i + 1)))
                        break
                except Exception as retry_error:
                    error_list.append(retry_error)
                    retry_count += 1
                    print('%s [error] - %s节点【%s】执行出错后第 %d 次重试，执行依然出错' % (time.strftime(date_format,
                                                                                       time.localtime(int(time.time()))), branch_flag, current_node['label'], (i + 1)))

            if retry_count == int(general_property['retry_count']):
                print('%s [error] - %s节点【%s】执行出错后 %d 次重试，全部执行出错' % (time.strftime(date_format, time.localtime(
                    int(time.time()))), branch_flag, current_node['label'], retry_count), error_list)

                exception_result = None
                if next_lines is not None and len(next_lines) > 0:
                    print('%s - %s节点【%s】的异常处理开始执行' % (time.strftime(date_format,
                                                                    time.localtime(int(time.time()))), branch_flag, current_node['label']))
                    for next_line in next_lines:
                        next_node = find_node(
                            nodes=project_config['nodes'], id=next_line['target'])
                        if next_node['shapeType'] == 'Abnormal':
                            exception_result = execute(
                                project_config=project_config, current_node=next_node, options=options)
                execute_failed_nodes.append({
                    'node': current_node,
                    'error': e
                })
                if exception_result is None or exception_result == True:
                    end_node = find_end_node(project_config['nodes'])
                    if end_node is not None:
                        execute_result = execute(
                            project_config=project_config, current_node=end_node, options=options)
                    print('%s - %s节点【%s】异常处理完成，流程终止' % (time.strftime(date_format,
                                                                      time.localtime(int(time.time()))), branch_flag, current_node['label']))
                    raise e
                print('%s - %s节点【%s】异常处理完成，流程继续往下执行' % (time.strftime(date_format,
                                                                      time.localtime(int(time.time()))), branch_flag, current_node['label']))
        else:
            exception_result = None
            if next_lines is not None and len(next_lines) > 0:
                print('%s - %s节点【%s】的异常处理开始执行' % (time.strftime(date_format,
                                                                time.localtime(int(time.time()))), branch_flag, current_node['label']))
                for next_line in next_lines:
                    next_node = find_node(
                        nodes=project_config['nodes'], id=next_line['target'])
                    if next_node['shapeType'] == 'Abnormal':
                        exception_result = execute(
                            project_config=project_config, current_node=next_node, options=options)
            execute_failed_nodes.append({
                'node': current_node,
                'error': e
            })
            if exception_result is None or exception_result == True:
                end_node = find_end_node(project_config['nodes'])
                if end_node is not None:
                    execute_result = execute(
                        project_config=project_config, current_node=end_node, options=options)
                print('%s - %s节点【%s】异常处理完成，流程终止' % (time.strftime(date_format,
                                                                  time.localtime(int(time.time()))), branch_flag, current_node['label']))
                raise e
            print("Exception>>>>>>>>>>", global_data_store)
            print('%s - %s节点【%s】异常处理完成，流程继续往下执行' % (time.strftime(date_format,
                                                                  time.localtime(int(time.time()))), branch_flag, current_node['label']))

    # prev_lines = find_prev_lines(edges=project_config['edges'], target_node=current_node)

    if next_lines is not None and len(next_lines) > 0:

        wait_nodes = find_wait_node(
            nodes=project_config['nodes'], next_lines=next_lines)
        # 下一节点中是否存在等待节点，存在则先执行等待节点
        if wait_nodes is not None and len(wait_nodes) > 0:
            for wait_node in wait_nodes:
                print('%s - %s节点【%s】的等待支线【%s】开始执行' % (time.strftime(date_format, time.localtime(
                    int(time.time()))), branch_flag, current_node['label'], wait_node['label']))
                execute(project_config=project_config,
                        current_node=wait_node, options=options)
                print('%s - %s节点【%s】的等待支线【%s】执行完成' % (time.strftime(date_format, time.localtime(
                    int(time.time()))), branch_flag, current_node['label'], wait_node['label']))

        for next_line in next_lines:
            next_node = find_node(
                nodes=project_config['nodes'], id=next_line['target'])

            if current_node['shapeType'] == 'Circulation' and (next_line['sourceAnchor'] == 1 or next_line['sourceAnchor'] == 3):
                continue

            if current_node['shapeType'] == 'Condition':
                if not ('label' in next_line.keys() and next_line['label'] in execute_result.keys() and execute_result[next_line['label']] == True):
                    continue

            if next_node is None:
                raise Exception('下一节点不存在')
            else:
                if next_node['shapeType'] == 'Wait':
                    continue
                # 如果是异常处理节点，则跳过执行
                if next_node['shapeType'] == 'Abnormal':
                    if current_node['shapeType'] == 'End' and len(execute_failed_nodes) > 0:
                        pass
                    else:
                        continue
                print('%s - %s节点【%s】的子节点【%s】开始执行' % (time.strftime(date_format, time.localtime(
                    int(time.time()))), branch_flag, current_node['label'], next_node['label']))
                execute(project_config=project_config,
                        current_node=next_node, options=options)
    else:
        print('%s - %s节点【%s】没有子节点' % (time.strftime(date_format,
                                                    time.localtime(int(time.time()))), branch_flag, current_node['label']))

    return execute_result


def running(project_path, options):
    execute_result = ExecuteResult()
    global global_data_store
    global execute_failed_nodes
    execute_failed_nodes = []
    try:
        global_data_store.update(options['params'])
        project_config = None
        with open(project_path, 'r', encoding='UTF-8') as project_file:
            project_config = json.loads(project_file.read())
        print('%s - 项目【%s】开始执行' % (time.strftime(date_format,
                                                 time.localtime(int(time.time()))), project_config['project_name']))
        start_node = find_first_node(project_config['nodes'])
        end_node = find_end_node(project_config['nodes'])
        if start_node is not None and end_node is not None:
            execute(project_config=project_config,
                    current_node=start_node, options=options)
            if len(execute_failed_nodes) > 0:
                execute_result.success = False
                execute_result.code = -1
                execute_result.message = '项目【%s】执行完成，但存在 %d 个节点执行出错' % (
                    project_config['project_name'], len(execute_failed_nodes))
                execute.error = execute_failed_nodes
                print('%s [error] - 项目【%s】执行完成，但存在 %d 个节点执行出错' % (time.strftime(date_format, time.localtime(
                    int(time.time()))), project_config['project_name'], len(execute_failed_nodes)))
            else:
                execute_result.success = True
                execute_result.code = 0
                execute_result.message = '项目【%s】执行完成' % (
                    project_config['project_name'])
                print('%s [success] - 项目【%s】执行完成' % (time.strftime(date_format,
                                                                   time.localtime(int(time.time()))), project_config['project_name']))
        else:
            execute_result.success = False
            execute_result.code = -1
            execute_result.message = (
                '缺少开始节点' if start_node is None else '缺少结束节点')
            execute_result.error = None

    except Exception:
        execute_result.success = False
        execute_result.code = -1
        execute_result.message = '项目【%s】执行出错' % (
            project_config['project_name'])
        execute_result.error = traceback.format_exc().replace('\n', ' ')
        print('%s [error] - 项目【%s】执行出错：%s' % (time.strftime(date_format, time.localtime(int(time.time()))),
                                              project_config['project_name'], traceback.format_exc().replace('\n', ' ')))

    if execute_result.success == False:
        temp_failed_nodes = []
        print('>>>>>>>>>>>>>>>>>', len(execute_failed_nodes))
        for failed_node in execute_failed_nodes:
            temp_failed_nodes.append(failed_node['node']['label'])
        execute_result.failed_nodes = "、".join(temp_failed_nodes)

    return execute_result


def run_node(params):
    execute_result = ExecuteResult()
    try:
        project_config = None
        project_name = params['project_name']
        project_path = params['projects_dir'] + '\\' + \
            project_name + "\\" + project_name + ".json"
        with open(project_path, 'r', encoding='UTF-8') as project_file:
            project_config = json.loads(project_file.read())
        current_node = find_node(project_config['nodes'], id=params['node_id'])
        print('%s - 节点【%s】单独运行' % (time.strftime(date_format,
                                                 time.localtime(int(time.time()))), current_node['label']))
        execute_node = ExecuteNode(
            project_config=project_config, plugins_dir=params['plugins_dir'], options=params)
        execute_result = getattr(execute_node, current_node['shapeType'])(
            current_node=current_node)
        execute_result.success = True
        execute_result.code = 0
        execute_result.message = '节点【%s】单独运行完成' % (current_node['label'])
        print('%s [success] - 节点【%s】单独运行完成' % (time.strftime(date_format,
                                                             time.localtime(int(time.time()))), current_node['label']))
    except Exception:
        execute_result.success = False
        execute_result.code = -1
        execute_result.message = '节点【%s】单独运行出错' % (current_node['label'])
        execute_result.error = traceback.format_exc().replace('\n', ' ')
        print('%s [error] - 节点【%s】单独运行出错：%s' % (time.strftime(date_format, time.localtime(
            int(time.time()))), current_node['label'], traceback.format_exc().replace('\n', ' ')))

    return execute_result


def execute_python(options):
    sys.path.insert(0, options['py_dir'])
    user_site_packages_path = options['py_dir'] + '\\site-packages'
    sys.path.insert(1, user_site_packages_path)
    metaclass = importlib.import_module(options['py_name'])
    if options['py_name'] in sys.modules.keys():
        importlib.reload(metaclass)
    result = getattr(metaclass, options["method"])(options['params'])
    sys.path.remove(options['py_dir'])
    sys.path.remove(user_site_packages_path)
    return result


def handle_command(command, command_option, stdout):
    sys.stdout = stdout

    if command == "execute_project":
        global global_data_store
        global_data_store = {}

        # 连接socket.io
        sio.connect('http://localhost:63390')
        sio.emit('SHELL_INIT', {})
        sio.disconnect()
        # sio.wait()

        with open(command_option, 'r', encoding='UTF-8') as params_file:
            params = json.loads(params_file.read())
            # print('参数文件内容：', params)

        sys.stdout.set_log_file(filename=params['log_file'])
        GlobalVariable.environment_options = params['environment_options']
        project_path = params['projects_dir'] + '\\' + \
            params['project_name'] + '\\' + params['project_name'] + '.json'
        execute_result = running(project_path=project_path, options=params)
        # str_execute_result = ''

        # while not sys.stdout.logger_msg_queue.empty():
        #     str_execute_result = sys.stdout.logger_msg_queue.get() + '\n' + str_execute_result
        if execute_result.success is True:
            execute_result.message = "项目执行成功"
        else:
            execute_result.error = "项目执行出错，出错节点：" + execute_result.failed_nodes
        with open(command_option.replace('.txt', '_result.txt'), 'w', encoding='UTF-8') as result_file:
            result_file.write(execute_result.to_string())
        sys.stderr.write('finish')
    elif command == "execute_python":
        with open(command_option, 'r', encoding='UTF-8') as params_file:
            params = json.loads(params_file.read())

        GlobalVariable.environment_options = params['environment_options']
        execute_result = execute_python(options=params)
        with open(command_option.replace('.txt', '_result.txt'), 'w', encoding='UTF-8') as result_file:
            result_file.write(json.dumps(execute_result))
        sys.stderr.write('finish')
    elif command == "execute_node":
        with open(command_option, 'r', encoding='UTF-8') as params_file:
            params = json.loads(params_file.read())
        GlobalVariable.environment_options = params['environment_options']
        execute_result = run_node(params=params)
        with open(command_option.replace('.txt', '_result.txt'), 'w', encoding='UTF-8') as result_file:
            result_file.write(execute_result.to_string())
        sys.stderr.write('finish')
    else:
        # print("不支持的指令")
        pass


if __name__ == "__main__":
    # sys.stdout = Logger()
    sio.connect('http://localhost:63390')
    sio.emit('SHELL_INIT', {})
    sio.disconnect()
    # sys.stdout.set_log_file(filename="C:\\UiAuto\\.uiauto\\拉卡拉_主任务执行\\.uiauto.log")
    execute_result = running(project_path="C:\\UiAuto_files\\projects\\拉卡拉_主任务执行\\拉卡拉_主任务执行.json", options={
        "project_name": "demo",
        "client_dir": "C:\\UiAuto",
        "plugins_dir": "C:\\UiAuto_files\\plugins",
        "projects_dir": "C:\\UiAuto_files\\projects",
        "executor_dir": "C:\\UiAuto\\public\\base_integration\\uiauto_executor",
        "sys_site_packages_dir": "C:\\UiAuto\\env\\python\\win32\\Lib\\site-packages",
        "params": {
            "uiauto_browser": {},
            "uiauto_token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTgsImxhc3RMb2dpblRpbWUiOjE1NzQ3NTU5OTQwMDAsInVzZXJuYW1lIjoiZ3VhbmhtIiwicGxhdGZvcm0iOiJ1aWF1dG8iLCJpYXQiOjE1NzQ3NTU5OTQsImV4cCI6MTU3NzM0Nzk5NH0.MO--PuTVnXn-OqfyfK-1qZDylyFkJ-AMbwSptxhKzl4"
        },
        "log_file": "C:\\UiAuto\\.uiauto\\拉卡拉_主任务执行\\.uiauto.log",
        "environment_options": {
            "client_dir": "C:\\UiAuto"
        }
    })
