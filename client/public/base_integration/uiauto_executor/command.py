from concurrent.futures import process
import subprocess
import sys
import os
import platform
import io
import threading
import json
import importlib
import ctypes
import inspect
import traceback

import asyncio
from urllib.parse import unquote
sys.path.insert(0, os.path.split(os.path.realpath(__file__))[0] + "/base")
from queue import Queue, LifoQueue
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

# if platform.system().lower() == 'windows':
import eventlet
eventlet.monkey_patch()


class Logger(object):

    def __init__(self):
        self.terminal = sys.stdout
        self.log = None
        self.logger_msg_queue = LifoQueue(maxsize=10000)

    def set_log_file(self, filename):
        self.log = open(filename, "ab", buffering=0)
 
    def write(self, message):
        self.terminal.write(message)
        self.log and self.log.write(message.encode('UTF-8'))
        # self.logger_msg_queue.put(message)
 
    def flush(self):
        pass


def _async_raise(tid, exctype):
    """raises the exception, performs cleanup if needed"""
    # tid = ctypes.c_long(tid)
    print(tid)
    if not inspect.isclass(exctype):
        exctype = type(exctype)
    res = ctypes.pythonapi.PyThreadState_SetAsyncExc(tid, ctypes.py_object(exctype))
    if res == 0:
        raise ValueError("invalid thread id")
    elif res != 1:
        # """if it returns a number greater than one, you're in trouble,
        # and you should call it again with exc=NULL to revert the effect"""
        ctypes.pythonapi.PyThreadState_SetAsyncExc(tid, None)
        raise SystemError("PyThreadState_SetAsyncExc failed")
 

def stop_thread(thread):
    _async_raise(thread.ident, SystemExit)


if __name__ == "__main__":

    current_dir = os.path.dirname(__file__)
    sys.path.insert(0, current_dir)
    module = importlib.import_module("runner")
    # sys.stdout = Logger()

    asyncio.set_event_loop(asyncio.new_event_loop())

    while True:
        try:
            shell_line = input().rstrip('\n').rstrip('\r')
            shell = shell_line.split(' ')
            if len(shell) == 0:
                # print('执行器不接受空指令')
                pass
            else:
                if len(shell) >= 1:
                    command = shell[0]
                if len(shell) >= 2:
                    execute_option_file = shell[1]
                    execute_option_file = unquote(execute_option_file, 'utf-8')

                if command == "" or command == " ":
                    pass
                elif command == 'exit':
                    sys.exit()
                elif command == "stop":
                    pass
                else:
                    module.handle_command(command=command, execute_option_file=execute_option_file)
        except Exception:
            sys.stderr.write(''.join(traceback.format_exc()))

