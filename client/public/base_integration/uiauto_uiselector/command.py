import subprocess
import sys
import json
import os
import importlib
from queue import Queue, LifoQueue


class Logger(object):

    def __init__(self, fileN="Default.log"):
        self.terminal = sys.stdout
        # fileN = fileN.replace('.uiauto.log', 'uiauto.log')
        self.log = open(fileN, "ab", buffering=0)
 
    def write(self, message):
        self.terminal.write(message)
        self.log.write(message.encode('UTF-8'))
 
    def flush(self):
        pass


if __name__ == "__main__":
    # sys.stdout = Logger(fileN="uiselector.log")
    current_dir = os.path.dirname(__file__)
    sys.path.insert(0, current_dir)
    module = importlib.import_module("index")
    while True:
        shell_line = input().rstrip('\n')
        print('接收到的指令：%s' % shell_line)
        shell = shell_line.split(' ')
        if len(shell) == 0:
            print('选择器不接受空指令')
        else:
            if len(shell) >= 1:
                command = shell[0]
            if len(shell) >= 2:
                command_option = shell[1]

        if command == 'execute':
            with open(command_option, 'r', encoding='UTF-8') as params_file:
                params = json.loads(params_file.read())
            execute_result = module.main(params)
            with open(command_option.replace('.txt', '_result.txt'), 'w', encoding='UTF-8') as result_file:
                result_file.write(json.dumps(execute_result))
        elif command == 'remote_browser':
            with open(command_option, 'r', encoding='UTF-8') as params_file:
                params = json.loads(params_file.read())
            execute_result = module.remote_browser(params)
        elif command == 'open_browser':
            with open(command_option, 'r', encoding='UTF-8') as params_file:
                params = json.loads(params_file.read())
            execute_result = module.open_browser(params)
            with open(command_option.replace('.txt', '_result.txt'), 'w', encoding='UTF-8') as result_file:
                result_file.write(json.dumps(execute_result))
        elif command == 'exit':
            sys.exit()
        else:
            print('不支持的指令：%s' % shell_line)