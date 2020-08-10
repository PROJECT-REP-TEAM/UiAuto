import sys
import json
import traceback
import time
import os
import socketio
import threading
import requests

# sio.connect('http://localhost:63360')

# 日志类
class Logger(object):


    def __init__(self):
        self.terminal = sys.stdout
        self.log = None

        self.line = ""

        self.project_name = None
        self.device_id = None
        self.task_id = None


    def set_log_file(self, filename):
        # sio.connect('http://localhost:63360')
        self.log = open(filename, "ab", buffering=0)
        pass


    def reset_log_file(self):
        # sio.disconnect()
        if self.log is not None:
            self.log.close()
            self.log = None
        
    
    def init_socket_data(self, server_url, project_name, device_id, task_id, token=None):
        self.server_url = server_url
        self.project_name = project_name
        self.device_id = device_id
        self.task_id = task_id
        self.token = token


    def send_log(self, status, content, options):
        try:
            if self.project_name is not None:
                
                res = requests.post(url="http://127.0.0.1:3000/uiauto/common/send_log", data={
                    "deviceId": self.device_id,
                    "project_name": self.project_name,
                    "taskId": self.task_id,
                    "status": status,
                    "content": content,
                    "nodeId": (options['node_id'] if options is not None and 'node_id' in options.keys() else None),
                    "logOrder": (options['logOrder'] if options is not None and 'logOrder' in options.keys() else None)
                })
        except Exception as e:
            print(e)


    def write(self, message):
        self.terminal.write(message)
        self.log and self.log.write(message.encode('UTF-8'))

        if message != "\n":
            self.line = self.line + message
        else:
            # sio.emit('LOG_WRITE', self.line)
            self.line = ""

        # if self.line == "":
        #     if "[log]" in message
        #     self.line = message
        

    def flush(self):
        pass


# 重写日志打印
sys.stdout = Logger()
__print = print
LEVEL_LOG = "log"
LEVEL_ERROR = "error"
LEVEL_WARN = "warn"
LEVEL_SUCCESS = "success"
LEVEL_INFO = "info"
IS_PRODUCT = True


def print(*value, sep=" ", end="\n", flush=False, level=LEVEL_LOG, options=None):

    # for v in value:
    #     if isinstance(v, dict):
    #         index = value.index(v)
    #         value = value[:index] + \
    #             (json.dumps(v, sort_keys=False, indent=4, separators=(',', ': '), ensure_ascii=False), ) + \
    #             value[index + 1:]
    #         pass
    # 日志打印时间的格式
    date_format = "%Y-%m-%d %H:%M:%S"

    if level is not LEVEL_LOG:
        content = ""
        for v in value:
            if isinstance(v, str):
                content = content + " " + v
            elif isinstance(v, dict):
                content = content + " " + json.dumps(v)
            elif isinstance(v, list):
                content = content + " " + str(v)

        sys.stdout.send_log(status=level, content=content, options=options)

    if IS_PRODUCT is False:
        value = ("filename: %s line: %s -" %
                 (traceback.extract_stack()[-2].filename, traceback.extract_stack()[-2].lineno), ) + value

    __print("[line:]" +  
        time.strftime(date_format, time.localtime(int(time.time()))) + " [%s]" % (level), *value, sep=sep, end=end, flush=flush)
