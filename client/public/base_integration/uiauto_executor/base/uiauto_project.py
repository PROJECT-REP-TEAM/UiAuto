import traceback
import time
import sys
import os
import re
import json
import multiprocessing
import importlib
import jpype
import socketio
import eventlet
from execute_result import ExecuteResult
from logger import print, LEVEL_ERROR, LEVEL_SUCCESS, LEVEL_INFO, LEVEL_WARN

project_config_store = None


def __init():
    global project_config_store
    project_config_store = {}


# 保存项目配置
def save_project(project_name, config, global_variable):
    project_config_store[project_name] = __Project__(
        config=config, global_variable=global_variable)


# 根据项目名称获取对应的项目配置
def get_project(project_name):
    return project_config_store[project_name]


sio = socketio.Client()


@sio.event
def connect():
    # print('connection established')
    pass


@sio.event
def disconnect():
    # print('disconnected from server')
    pass


MODE_PROJECT = "project"
MODE_NODE = "node"


class ExecutionTimeoutException(Exception):
    def __init__(self):
        Exception.__init__(self, '执行超时')


# 项目执行的主方法
def execute_project(project_name):
    execute_result = ExecuteResult()
    try:
        project = get_project(project_name=project_name)
        print("项目【%s】开始执行" % project_name, level=LEVEL_INFO)

        start_node = project.find_node(shape_type="Start")
        end_node = project.find_node(shape_type="End")

        if start_node is not None and end_node is not None:
            execute_result = project.execute(current_node=start_node, options={
                "mode": MODE_PROJECT
            })
            if execute_result.success:
                print("项目【%s】执行成功" % project_name, level=LEVEL_SUCCESS)
            else:
                print("项目【%s】执行失败" % project_name, level=LEVEL_ERROR)
        else:
            print(('缺少开始节点' if start_node is None else '缺少结束节点'), level=LEVEL_ERROR)
            execute_result.success = False
            execute_result.code = -1
            execute_result.message = (
                '缺少开始节点' if start_node is None else '缺少结束节点')
            execute_result.error = None

    except Exception as e:
        print('>>>>>>>>', traceback.format_exc())
        execute_result.success = False
        execute_result.code = -1
        execute_result.message = "项目执行出现未知异常"
        execute_result.error = traceback.format_exc()

    return execute_result


class __Project__():

    def __init__(self, config, global_variable):
        super().__init__()
        self.config = config
        self.global_variable = global_variable
        self.plugins_dir = global_variable.get_value(
            'environment_options')['plugins_dir']
        self.client_dir = global_variable.get_value(
            'environment_options')['client_dir']
        self.executor_dir = global_variable.get_value(
            'environment_options')['executor_dir']
        self.user_site_packages_dir = global_variable.get_value(
            'environment_options')['user_site_packages_dir']

    # 执行
    def execute(self, current_node=None, options={}):
        execute_result = ExecuteResult()
        node_result = None
        try:

            if current_node is None:
                raise Exception("不能执行空节点")

            print("节点【%s】开始执行" % current_node["label"], level=LEVEL_INFO, options={"node_id": current_node['id'], "logOrder": 1})
            # 获取当前节点的参数
            node_params = self.generate_node_params(node=current_node)
            print("节点【%s】参数：" % current_node["label"], node_params)
            # 获取当前节点所对应的插件配置
            node_plugin = self.find_plugin_for_node(node=current_node)
            # 获取当前节点所对应的操作
            node_operation = self.find_operation_for_node(
                plugin=node_plugin, node=current_node)
            # 获取当前节点的通用属性
            general_property = self.generate_general_property(
                node=current_node)
            # 获取当前节点的输出配置
            node_output = self.generate_output_data(node=current_node)
            # 获取以当前节点为起点的所有连线
            next_lines = self.find_next_lines(source_node=current_node)

            # 节点执行
            node_result = self.execute_node(current_node=current_node, general_property=general_property,
                                            node_plugin=node_plugin, node_operation=node_operation,
                                            node_params=node_params,
                                            node_output=node_output, options=options)

            if options['mode'] == MODE_PROJECT:
                # 节点执行异常，执行重试
                if not node_result.success:
                    if 'retry_count' in general_property.keys() and int(general_property['retry_count']) > 0:
                        print("节点【%s】执行异常，执行重试" % current_node["label"], level=LEVEL_WARN, options={"node_id": current_node['id']})
                        retry_count = int(general_property['retry_count'])
                        retry_index = 0
                        while retry_index < retry_count:
                            # 重试节点执行
                            node_result = self.execute_node(current_node=current_node,
                                                            general_property=general_property,
                                                            node_plugin=node_plugin, node_operation=node_operation,
                                                            node_params=node_params,
                                                            node_output=node_output, options=options)
                            if node_result.success:
                                break
                            else:
                                print("节点【%s】第 %s 次重试失败，错误信息：" % (current_node["label"], str(retry_index + 1)),
                                      node_result.error, level=LEVEL_ERROR, options={"node_id": current_node['id'], "logOrder": 1})
                                retry_index = retry_index + 1

                # 初始化异常处理结果
                is_kill_flow = None

                # 重试执行后执行结果依旧为失败，则执行异常处理支路
                if not node_result.success:

                    is_kill_flow = True

                    print("节点【%s】执行异常，异常信息：" % current_node['label'], node_result.error, level=LEVEL_ERROR, options={"node_id": current_node['id'], "logOrder": 1})
                    execute_result.success = False
                    execute_result.code = -1
                    execute_result.error = node_result.error

                    # 处理异常节点
                    abnormal_node_result = None
                    if next_lines and len(next_lines) > 0:
                        for next_line in next_lines:
                            # 查找下一个节点
                            next_node = self.find_node(node_id=next_line["target"])
                            print(next_node['shapeType'])
                            if next_node['shapeType'] == "Abnormal":
                                print("节点【%s】 -> 异常线路【%s】开始执行" %
                                      (current_node['label'], next_node['label']), level=LEVEL_INFO, options={"node_id": current_node['id'], "logOrder": 2})
                                abnormal_node_result = self.execute(
                                    current_node=next_node, options=options)
                                print("节点【%s】 -> 异常线路【%s】执行完成" %
                                      (current_node['label'], next_node['label']), level=LEVEL_SUCCESS, options={"node_id": current_node['id'], "logOrder": 3})
                                # 判断异常处理执行结果；若成功，则继续下一个异常处理；若失败，则跳出遍历
                                if not abnormal_node_result.success:
                                    is_kill_flow = True
                                    break
                                else:
                                    is_kill_flow = (
                                            is_kill_flow or abnormal_node_result.data)

                    # 判断是否执行了异常节点，若没有执行异常节点，则默认终止流程
                    if abnormal_node_result is not None and abnormal_node_result.success:
                        is_kill_flow = abnormal_node_result.data

                # 判断异常处理结果
                if is_kill_flow is True:
                    print('is_kill_flow>>>>>>', is_kill_flow)
                    # 终止流程
                    pass
                else:
                    print('节点【%s】执行完成，返回结果：' % (current_node['label']), node_result.data, level=LEVEL_INFO, options={"node_id": current_node['id'], "logOrder": 4})
                    

                    if next_lines and len(next_lines) > 0:

                        wait_node_result = None
                        # 处理等待节点
                        for next_line in next_lines:
                            next_node = self.find_node(node_id=next_line['target'])
                            if next_node and next_node['shapeType'] == 'Wait':
                                print('节点【%s】 -> 等待节点【%s】的支路执行开始' %
                                      (current_node['label'], next_node['label']), node_result.data, level=LEVEL_INFO, options={"node_id": current_node['id'], "logOrder": 5})
                                wait_node_result = self.execute(
                                    current_node=next_node, options=options)

                                if not wait_node_result.success:
                                    print('节点【%s】 -> 等待节点【%s】的支路执行出错，错误信息：' %
                                          (current_node['label'], next_node['label']), wait_node_result.error,
                                          level=LEVEL_ERROR, options={"node_id": current_node['id'], "logOrder": 6})
                                    is_kill_flow = True
                                    execute_result.success = False
                                    execute_result.code = -1
                                    execute_result.data = wait_node_result.error
                                    break
                                else:
                                    print('节点【%s】 -> 等待节点【%s】的支路执行完成' %
                                          (current_node['label'], next_node['label']), level=LEVEL_SUCCESS)
                                    is_kill_flow = (
                                            is_kill_flow or wait_node_result.data)

                        if is_kill_flow is True:
                            # 等待节点处理异常，流程终止
                            pass
                        else:
                            # 等待节点处理完成，继续处理流程
                            for next_line in next_lines:

                                # 若当前节点为循环节点，则跳过侧边路的执行
                                if current_node['shapeType'] == 'Circulation' and \
                                        (next_line['sourceAnchor'] == 1 or next_line['sourceAnchor'] == 3):
                                    continue

                                # 若当前节点为条件节点，则判断线路标记
                                if current_node['shapeType'] == 'Condition':
                                    if not (next_line['label'] in node_result.data.keys() and
                                            node_result.data[next_line['label']] == True):
                                        continue

                                # 查找下一个节点
                                next_node = self.find_node(
                                    node_id=next_line["target"])

                                # 跳过等待节点和异常节点
                                if next_node['shapeType'] == 'Wait' or next_node['shapeType'] == 'Abnormal':
                                    continue

                                # 判断节点是否存在
                                if next_node is not None:
                                    execute_result = self.execute(
                                        current_node=next_node, options=options)
                                else:
                                    raise Exception("下一节点不存在")
            else:
                if not node_result.success:
                    # print('节点【%s】执行出错' % (current_node['label']), level=LEVEL_ERROR)
                    print("节点【%s】执行异常，异常信息：" % current_node['label'], node_result.error, level=LEVEL_ERROR, options={"node_id": current_node['id'], "logOrder": 7})
                    execute_result.success = False
                    execute_result.code = -1
                    execute_result.error = node_result.error
                else:
                    print('节点【%s】执行完成，返回结果：' % (current_node['label']), node_result.data, level=LEVEL_INFO, options={"node_id": current_node['id'], "logOrder": 8})

        except Exception as e:
            print("节点【%s】执行异常，错误信息：" % current_node["label"], e, level=LEVEL_ERROR, options={"node_id": current_node['id'], "logOrder": 9})
            execute_result.success = False
            execute_result.code = -1
            execute_result.error = e

        # 如果当前节点为异常节点，则将异常节点的结果回传
        if current_node['shapeType'] == "Abnormal" and node_result is not None:
            execute_result.data = node_result.data

        return execute_result

    def execute_node(self, current_node, general_property, node_plugin, node_operation, node_params, node_output,
                     options):

        execute_result = ExecuteResult()

        try:

            # 根据通用属性控制节点是否延时执行
            if 'delayed_execution_time' in general_property.keys() and int(
                    general_property['delayed_execution_time']) > 0:
                delayed_execution_time = round(int(
                    general_property['delayed_execution_time']) / 1000, 2)
                print('节点【%s】延时执行：%.2f秒' %
                      (current_node['label'], delayed_execution_time))
                time.sleep(delayed_execution_time)

            # 根据通用属性控制节点执行是否超时
            if 'execution_timeout' in general_property.keys() and int(general_property['execution_timeout']) > 0:

                execution_timeout = round(int(general_property['execution_timeout']) / 1000, 2)

                print('节点【%s】执行超时限制：%.2f秒' %
                      (current_node['label'], execution_timeout))

                is_timeout = True
                with eventlet.Timeout(execution_timeout, False):
                    # 节点执行
                    execute_result.data = getattr(
                        self, current_node["shapeType"])(current_node=current_node, node_plugin=node_plugin,
                                                         node_operation=node_operation,
                                                         node_params=node_params, node_output=node_output,
                                                         options=options)

                    is_timeout = False

                if is_timeout == True:
                    raise ExecutionTimeoutException()

            else:
                print('节点【%s】执行无超时限制' %
                      (current_node['label'],))

                # 节点执行
                execute_result.data = getattr(
                    self, current_node["shapeType"])(current_node=current_node, node_plugin=node_plugin,
                                                         node_operation=node_operation,
                                                         node_params=node_params, node_output=node_output,
                                                         options=options)

            # 根据通用属性控制节点执行完之后是否等待
            if 'waiting_time_after_execution' in general_property.keys() and \
                    int(general_property['waiting_time_after_execution']) > 0:
                waiting_time_after_execution = round(int(
                    general_property['waiting_time_after_execution']) / 1000, 2)
                print('节点【%s】执行完成后等待：%.2f秒' %
                      (current_node['label'], waiting_time_after_execution))
                time.sleep(waiting_time_after_execution)
        except ExecutionTimeoutException:
            execute_result.success = False
            execute_result.code = -1
            execute_result.error = "执行超时"
        except Exception:
            execute_result.success = False
            execute_result.code = -1
            execute_result.error = traceback.format_exc()

        return execute_result

    # 开始节点的执行方法
    def Start(self, current_node, node_plugin, node_operation, node_params, node_output, options):
        return None

    # 条件节点的执行方法
    def Condition(self, current_node, node_plugin, node_operation, node_params, node_output, options):
        execute_result = {}
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

    # 循环节点的执行方法
    def Circulation(self, current_node, node_plugin, node_operation, node_params, node_output, options):
        execute_result = None

        if node_params['array'] is None or node_params['array'] == "":
            raise Exception('参数缺失')
        else:
            next_nodes = []
            next_lines = self.find_next_lines(source_node=current_node)
            for next_line in next_lines:
                if next_line['sourceAnchor'] == 1 or next_line['sourceAnchor'] == 3:
                    next_node = self.find_node(node_id=next_line['target'])
                    next_nodes.append(next_node)
            if next_nodes is not None and len(next_nodes) > 0:
                print('循环节点【%s】支路执行开始' % (current_node['label']))
                for item in node_params['array']:
                    if 'value' in node_output.keys() and node_output['value'] is not None and \
                            node_output['value'] != '':
                        self.global_variable.set_value(
                            node_output['value'], item)

                    for next_node in next_nodes:
                        child_line_result = self.execute(
                            current_node=next_node, options=options)
                        if not child_line_result.success:
                            raise Exception("支路执行异常")

                print('循环节点【%s】支路执行完成' % (current_node['label']))
            else:
                pass

        return execute_result

    # 通用节点执行方法
    def Convention(self, current_node, node_plugin, node_operation, node_params, node_output, options):
        execute_result = None
        plugin_dir = self.plugins_dir + "\\" + node_plugin['id'] + "\\" + node_plugin['version']
        exec_name = 'index'
        # 将UiAuto的基础设置参数传递给插件方法
        node_params["uiauto_config"] = self.global_variable.get_value(
            "environment_options")
        # 基于python开发的插件执行
        if node_plugin['language'] == 'python':
            execute_result = self.execute_python(params=node_params, options={
                'py_dir': plugin_dir,
                'py_name': exec_name,
                'method': node_operation['method'],
                'plugin_name': node_plugin['name'],
                'version': node_plugin['version']
            })
        # 基于nodejs开发的插件执行
        elif node_plugin['language'] == 'nodejs':
            execute_result = self.execute_nodejs(options={
                'js_path': plugin_dir + "\\" + exec_name + ".js",
                'method': node_operation['method'],
                'node': current_node,
                'params': node_params,
                'version': node_plugin['version']
            })
        # 基于java开发的插件执行
        elif node_plugin['language'] == 'java':
            process_queue = multiprocessing.Queue()
            process = multiprocessing.Process(target=self.execute_java, args=(process_queue, node_params, {
                'executor_dir': self.executor_dir,
                'plugin_dir': plugin_dir,
                'main': node_plugin['main'],
                'jar': node_plugin['jar'],
                'method': node_operation['method'],
                'version': node_plugin['version']
            }))
            process.daemon = True
            process.start()
            execute_result = process_queue.get()
            process.terminate()
        else:
            raise Exception('当前插件语言尚未支持')

        if 'is_allow_global_use' in node_output.keys() and node_output['is_allow_global_use'] == True and \
                'value' in node_output.keys() and node_output['value'] is not None and node_output['value'] != '':
            self.global_variable.set_value(
                node_output['value'], execute_result)

        return execute_result

    # 异常节点的执行方法
    def Abnormal(self, current_node, node_plugin, node_operation, node_params, node_output, options):
        execute_result = node_params['kill_task']

        # next_lines = self.find_next_lines(source_node=current_node)
        # if next_lines and len(next_lines) > 0:
        #     for next_line in next_lines:
        #         next_node = self.find_node(node_id=next_line['target'])
        #
        #         print('异常节点【%s】支路执行开始' % (current_node['label']))
        #
        #         # child_line_result = self.execute(
        #         #     current_node=next_node, options=options)
        #         # if not child_line_result.success:
        #         #     raise Exception("【异常】支路执行异常")
        #
        #         print('异常节点【%s】支路执行完成' % (current_node['label']))

        return execute_result

    # 等待节点的执行方法
    def Wait(self, current_node, node_plugin, node_operation, node_params, node_output, options):
        execute_result = True
        return execute_result

    # 执行子流程节点
    def Subprocess(self, current_node, node_plugin, node_operation, node_params, node_output, options):
        execute_result = None

        project_name = node_params['project_name']
        participation = node_params['participation']

        environment_options = self.global_variable.get_value("environment_options")

        print("子流程【%s】开始执行" % project_name)
        project_path = "%s\\%s\\%s.json" % (environment_options["projects_dir"], project_name, project_name)

        with open(project_path, 'r', encoding='UTF-8') as project_file:
            project_config = json.loads(project_file.read())

        # self.global_variable.update(variable=node_params)
        if node_params['participation'] is not None and node_params['participation'] != '':
            self.global_variable.update(variable=node_params['participation'])

        save_project(project_name=project_name, config=project_config, global_variable=self.global_variable)

        execute_result = execute_project(project_name=project_name)

        if execute_result.success:
            print("子流程【%s】执行成功" % project_name)
        else:
            print("子流程【%s】执行出错" % project_name)

        if 'is_allow_global_use' in node_output.keys() and node_output['is_allow_global_use'] == True and \
                'value' in node_output.keys() and node_output['value'] is not None and node_output['value'] != '':
            self.global_variable.set_value(
                node_output['value'], execute_result)

        return execute_result

    # 代码节点的执行方法
    def Script(self, current_node, node_plugin, node_operation, node_params, node_output, options):
        execute_result = None
        if 'code' in node_params and node_params['code'] is not None and node_params['code'] != '':
            if node_plugin['language'] == 'python':
                with open('%s\\script_node_py_template.py' % self.executor_dir, 'r', encoding='UTF-8') as template_file:
                    template_code = template_file.read()
                node_params['code'] = node_params['code'].replace(
                    "\n", "\n    ")
                template_code = template_code.replace(
                    '#execute_code', node_params['code'])
                temp_dir = self.executor_dir + '\\temp\\'
                temp_file_name = 'py_script_%s_%s_%s' % (current_node['label'], current_node['id'],
                                                         time.strftime('%Y%m%d%H%M%S',
                                                                       time.localtime(int(time.time()))))
                temp_file_path = temp_dir + temp_file_name + '.py'
                with open(temp_file_path, 'w', encoding='UTF-8') as template_file:
                    template_file.write(template_code)

                sys.path.insert(0, temp_dir)
                try:
                    script = __import__(temp_file_name)
                    script.print = print
                    script_store = self.global_variable.get_all()
                    execute_result = getattr(script, 'script_node_executor')(script_store)
                    self.global_variable.update(variable=script_store)
                    sys.path.remove(temp_dir)
                    os.remove(temp_file_path)
                except Exception as e:
                    sys.path.remove(temp_dir)
                    os.remove(temp_file_path)
                    raise e


            elif node_plugin['language'] == 'nodejs':
                with open('%s\\script_node_js_template.js' % self.executor_dir, 'r', encoding='UTF-8') as template_file:
                    template_code = template_file.read()
                node_params['code'] = node_params['code'].replace(
                    "\n", "\n    ")
                template_code = template_code.replace(
                    '// execute_code', node_params['code'])
                temp_dir = self.executor_dir + '\\temp\\'
                temp_file_name = 'js_script_%s_%s_%s' % (current_node['label'], current_node['id'],
                                                         time.strftime('%Y%m%d%H%M%S',
                                                                       time.localtime(int(time.time()))))
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

                # print(temp_file_path)
                sio.emit('SHELL_EXECUTE_SCRIPT', json.dumps({
                    'js_path': temp_file_name,
                    '$store': self.global_variable.get_all(),
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
                'value' in node_output.keys() and node_output['value'] is not None and node_output['value'] != '':
            self.global_variable.set_value(
                node_output['value'], execute_result)

        return execute_result

    # 结束节点的执行方法
    def End(self, current_node, node_plugin, node_operation, node_params, node_output, options):
        return None

    # 执行python插件的方法
    def execute_python(self, params, options):
        sys.path.insert(0, options['py_dir'])
        plugin_site_packages_path = options['py_dir'] + '\\site-packages'
        user_site_packages_path = '%s\\%s\\%s' % (self.user_site_packages_dir, options['plugin_name'], options['version'])
        sys.path.insert(1, user_site_packages_path)
        sys.path.insert(2, plugin_site_packages_path)
        metaclass = importlib.import_module(options['py_name'])
        metaclass.print = print
        if options['py_name'] in sys.modules.keys():
            importlib.reload(metaclass)
        result = getattr(metaclass, options['method'])(params)
        sys.path.remove(options['py_dir'])
        sys.path.remove(user_site_packages_path)
        sys.path.remove(plugin_site_packages_path)
        return result

    # 执行nodejs插件的方法
    def execute_nodejs(self, options):
        if sio.connected == False:
            # 连接socket.io
            sio.connect('http://127.0.0.1:63390')

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

    # 执行java插件的方法
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

    # 解析节点参数
    def generate_node_params(self, node):
        node_params = {}
        for node_input in node['input']:
            for input_property in node_input['properties']:
                node_params.update(self.analytical_expression(
                    input_property=input_property, global_data=self.global_variable.get_all()))

        return node_params

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
                    javascript_match = re.findall(r'@\s??js', match_value)
                    if len(javascript_match) == 0:
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
                    input_value = input_property['value']
                    for match_value in match_values:
                        # 检索@js表达式标记
                        javascript_match = re.findall(r'@\s??js', match_value)
                        if len(javascript_match) == 0:
                            # 检索@py表达式标记
                            python_match = re.findall(r'@\s??py', match_value)
                            for py_match in python_match:
                                match_value = match_value.replace(py_match, '')
                                input_value = input_value.replace(
                                    py_match, '')
                            scope = eval(match_value, global_data)
                            input_value = input_value.replace(
                                '${%s}' % match_value, str(scope))
                    result[input_property['id']] = input_value
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

    # 生成插件输出配置
    def generate_output_data(self, node):
        output = {}
        if 'output' in node.keys():
            output = node['output']
        return output

    # 查找节点对应的插件
    def find_plugin_for_node(self, node):
        plugin = None
        plugin_path = self.plugins_dir + "\\" + \
                      node['plugin_id'] + "\\" + node['version'] + "\\package.json"
        if not os.path.exists(plugin_path):
            plugin_path = self.plugins_dir + "\\" + \
                      node['plugin_id'] + "\\" + self.get_latest_version(node=node) + "\\package.json"
        if os.path.exists(plugin_path):
            with open(plugin_path, 'r', encoding='UTF-8') as plugin_file:
                plugin = json.loads(plugin_file.read())
        else:
            raise Exception('当前节点的插件不存在')

        return plugin

    
    def get_latest_version(self, node):
        plugin_path = "%s\\%s" % (self.plugins_dir, node['plugin_id'])
        version_list = os.listdir(plugin_path)
        reverse_version = {}
        for version in version_list:
            if os.path.isdir("%s\\%s" % (plugin_path, version)):
                reverse_version[int(version.replace(".", ""))] = version
        
        max_verstion = max(reverse_version.keys())

        return reverse_version[max_verstion]


    # 查找节点对应的操作
    def find_operation_for_node(self, plugin, node):
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

    # 根据ID查找节点
    def find_node(self, node_id=None, shape_type=None):
        target_node = None
        for node in self.config["nodes"]:
            if node_id is not None and shape_type is not None:
                if node['id'] == node_id and node['shapeType'] == shape_type:
                    target_node = node
            else:
                if node_id is not None and node['id'] == node_id:
                    target_node = node

                if shape_type is not None and node['shapeType'] == shape_type:
                    target_node = node

        return target_node

    # 查找下一节点的线路
    def find_next_lines(self, source_node):
        next_lines = []
        if 'edges' in self.config.keys():
            if source_node is None:
                raise Exception('查找下一步线路时，源节点不存在')
            else:
                for edge in self.config["edges"]:
                    if edge['source'] == source_node['id']:
                        next_lines.append(edge)
        return next_lines

    # 生成插件的通用属性
    def generate_general_property(self, node):
        result = {}
        if "general_property" not in node.keys():
            raise Exception('插件没有通用属性配置')
        else:
            general_property = (node['general_property']
                                if node['general_property'] is not None else [])
            for gp in general_property:
                result[gp['id']] = gp['value']

        return result
