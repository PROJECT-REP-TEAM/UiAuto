import sys
import os
sys.path.insert(0, os.path.split(os.path.realpath(__file__))[0] + "\\\\base")
from queue import LifoQueue
from execute_result import ExecuteResult
import global_variable
import uiauto_project as UiAutoProject
from logger import print, LEVEL_ERROR, LEVEL_SUCCESS, LEVEL_INFO, LEVEL_WARN
from urllib.parse import unquote, quote
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
import io
import json
import base.screenrecorder.index as screenrecorder


# 初始化socketio client
sio = socketio.Client()


@sio.event
def connect():
    # print('connection established')
    pass


@sio.event
def disconnect():
    # print('disconnected from server')
    pass


# 执行python脚本
def execute_python(options):
    sys.path.insert(0, options['environment_options']['py_dir'])
    user_site_packages_path = options['environment_options']['py_dir'] + '\\site-packages'
    sys.path.insert(1, user_site_packages_path)
    metaclass = importlib.import_module(options['environment_options']['py_name'])
    if options['environment_options']['py_name'] in sys.modules.keys():
        importlib.reload(metaclass)
    result = getattr(metaclass, options['environment_options']["method"])(options['params'])
    sys.path.remove(options['environment_options']['py_dir'])
    sys.path.remove(user_site_packages_path)
    return result


# 执行单一节点
def execute_single_node(project_name, node_id):
    execute_result = ExecuteResult()
    try:
        project = UiAutoProject.get_project(project_name=project_name)
        node = project.find_node(node_id=node_id)
        if node is not None:
            execute_result = project.execute(current_node=node, options={
                "mode": UiAutoProject.MODE_NODE
            })
            if execute_result.success:
                print("节点【%s】执行成功" % node['label'], level=LEVEL_SUCCESS)
            else:
                print("节点【%s】执行失败" % node['label'], level=LEVEL_ERROR)
        else:
            print('节点不存在', level=LEVEL_ERROR)
            execute_result.success = False
            execute_result.code = -1
            execute_result.message = "节点不存在"
            execute_result.error = None
    except Exception:
        print('执行节点出错，错误信息：', traceback.format_exc())
        execute_result.success = False
        execute_result.code = -1
        execute_result.message = "执行节点出错"
        execute_result.error = traceback.format_exc()

    return execute_result


# 执行命令
def handle_command(command, execute_option_file):
    
    if command == "execute_project":

        # 连接socket.io
        sio.connect('http://127.0.0.1:63390')
        sio.emit('SHELL_INIT', {})
        sio.disconnect()

        with open(execute_option_file, "rb") as __execute_option_file:
            execute_option = __execute_option_file.read()
            if execute_option == "":
                raise Exception("执行配置有误")
            else:
                execute_option = json.loads(execute_option)

        # 初始化日志文件
        sys.stdout.set_log_file(filename=execute_option["environment_options"]['log_file'])

        print("------------------------------------------------------------------------------------")
        print("\n")
        
        server_url = execute_option['environment_options']['server_url']
        task_id = execute_option['params']['uiauto_task_id']
        device_id = execute_option['environment_options']['device_id']
        sys.stdout.server_host = execute_option["environment_options"]['server_url']
        sys.stdout.access_token = execute_option["environment_options"]['access_token']
        sys.stdout.init_socket_data(server_url=server_url, project_name=execute_option['project_name'], task_id=task_id, device_id=device_id)


        # 初始化共享变量存取空间
        global_variable.__init()
        global_variable.set_value(
            key="project_name", value=execute_option["project_name"], readonly=True)
        global_variable.set_value(
            key="environment_options", value=execute_option["environment_options"], readonly=True)
        global_variable.update(
            variable=execute_option["params"], readonly=True)
        print("初始化共享变量存取空间", global_variable.get_all())

        project_path = "%s\\%s\\%s.json" % (execute_option["environment_options"]["projects_dir"],
                                            execute_option["project_name"], execute_option["project_name"])

        with open(project_path, 'r', encoding='UTF-8') as project_file:
            project_config = json.loads(project_file.read())
        UiAutoProject.__init()
        UiAutoProject.save_project(
            project_name=execute_option["project_name"], config=project_config, global_variable=global_variable)

        execute_result = UiAutoProject.execute_project(project_name=global_variable.get_value("project_name"))

        with open(execute_option_file.replace('.txt', '_result.txt'), 'w', encoding='UTF-8') as result_file:
            result_file.write(execute_result.to_string())
        sys.stderr.write('finish')
        sys.stdout.reset_log_file()
        # sys.stdout.reset_socket()

    elif command == "execute_python":
        with open(execute_option_file, "rb") as __execute_option_file:
            execute_option = __execute_option_file.read()
            if execute_option == "":
                raise Exception("执行配置有误")
            else:
                execute_option = json.loads(execute_option)

        execute_result = execute_python(options=execute_option)
        with open(execute_option_file.replace('.txt', '_result.txt'), 'w', encoding='UTF-8') as result_file:
            result_file.write(json.dumps(execute_result))
        sys.stderr.write('finish')
    elif command == "execute_node":

        with open(execute_option_file, "rb") as __execute_option_file:
            execute_option = __execute_option_file.read()
            if execute_option == "":
                raise Exception("执行配置有误")
            else:
                execute_option = json.loads(execute_option)

        # 初始化日志文件
        sys.stdout.set_log_file(filename=execute_option["environment_options"]['log_file'])


        print("------------------------------------------------------------------------------------")
        print("\n")

        global_variable.__init()
        global_variable.set_value(
            key="project_name", value=execute_option["project_name"], readonly=True)
        global_variable.set_value(
            key="environment_options", value=execute_option["environment_options"], readonly=True)
        global_variable.update(
            variable=execute_option["params"], readonly=True)
        print("初始化共享变量存取空间", global_variable.get_all())

        project_path = "%s\\%s\\%s.json" % (execute_option["environment_options"]["projects_dir"],
                                            execute_option["project_name"], execute_option["project_name"])

        with open(project_path, 'r', encoding='UTF-8') as project_file:
            project_config = json.loads(project_file.read())
        UiAutoProject.__init()
        UiAutoProject.save_project(
            project_name=execute_option["project_name"], config=project_config, global_variable=global_variable)

        execute_result = execute_single_node(project_name=global_variable.get_value("project_name"), node_id=execute_option['params']['node_id'])

        with open(execute_option_file.replace('.txt', '_result.txt'), 'w', encoding='UTF-8') as result_file:
            result_file.write(execute_result.to_string())

        sys.stderr.write('finish')
        sys.stdout.reset_log_file()
    else:
        print("不支持的指令")


if __name__ == "__main__":

    handle_command(command="execute_project",
                   execute_option_file="Z:\\workspace\\legion\\code\\UiAuto\\client\\public\\base_integration\\uiauto_executor\\demo.txt")
    # command = input()
    # print(command)
    # process = multiprocessing.Process(target=handle_command, args=("execute_project", ""))
    # process.start()
    # process.join()
