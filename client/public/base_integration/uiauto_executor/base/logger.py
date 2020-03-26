import sys
import json
import traceback
import time
import os
import socketio

# sio = socketio.Client()
# sio.connect('http://localhost:63360')

# 日志类
class Logger(object):


    def __init__(self):
        self.terminal = sys.stdout
        self.log = None

        self.line = ""

    def set_log_file(self, filename):
        # sio.connect('http://localhost:63360')
        self.log = open(filename, "ab", buffering=0)
        pass

    def reset_log_file(self):
        # sio.disconnect()
        if self.log is not None:
            self.log.close()
            self.log = None

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
IS_PRODUCT = True


def print(*value, sep=" ", end="\n", flush=False, level=LEVEL_LOG):

    # for v in value:
    #     if isinstance(v, dict):
    #         index = value.index(v)
    #         value = value[:index] + \
    #             (json.dumps(v, sort_keys=False, indent=4, separators=(',', ': '), ensure_ascii=False), ) + \
    #             value[index + 1:]
    #         pass
    # 日志打印时间的格式
    date_format = "%Y-%m-%d %H:%M:%S"

    if IS_PRODUCT is False:
        value = ("filename: %s line: %s -" %
                 (traceback.extract_stack()[-2].filename, traceback.extract_stack()[-2].lineno), ) + value

    __print("[line:]" +  
        time.strftime(date_format, time.localtime(int(time.time()))) + " [%s]" % (level), *value, sep=sep, end=end, flush=flush)
