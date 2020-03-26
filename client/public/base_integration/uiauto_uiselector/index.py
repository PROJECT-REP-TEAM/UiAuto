from base import CoverFrame, ResumeBrowser, JavascriptRequest, ExecuteResult, ResourcesInfo
from base import UI_SELECTOR_MODE_NATIVE, UI_SELECTOR_MODE_SELENIUM, UI_SELECTOR_MODE_HYBRID
import wx
import io
import time
import os
import threading
import subprocess
import sys
import websockets
import json
import socket
from selenium import webdriver
from selenium.webdriver.common.by import By
from http.server import HTTPServer
import uiautomation
import asyncio
import pyHook
import pythoncom
import traceback
import ctypes
import inspect
from queue import Queue, LifoQueue
from PIL import ImageGrab
import datetime
from multiprocessing import Queue, Process, Manager
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

pythoncom.CoInitialize()

global_data_store = None
browser_driver = None

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


class Global_Data_Store(object):
    
    
    def __init__(self):
        self.cover_frame = None
        self.app = None
        self.project_dir = None
        self.driver = None
        self.target_control = None
        self.target_element = None
        self.thread_listen_mouse = None
        self.thread_remote_browser = None


def _async_raise(tid, exctype):
    """raises the exception, performs cleanup if needed"""
    tid = ctypes.c_long(tid)
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


def resize_native_cover_frame(control):
    """
    改变原生遮罩层的大小
    :param control:
    :return:
    """
    global global_data_store
    global browser_driver

    if browser_driver is not None:
        msg = browser_driver.execute_script('return window["uiauto_selected_result"]')
        if msg != "" and msg is not None:
            msg = msg.encode("gbk", 'ignore').decode("gbk", "ignore")
            msg = json.loads(msg)
            
            if 'html' in msg.keys():
                html = msg['html']
                if html['tag'] != 'IFRAME':
                    global_data_store.target_element = msg
                    bounding_client_rect = html["bounding_client_rect"]
                    global_data_store.cover_frame.SetPosition((html["offsetX"] + bounding_client_rect["left"], html["offsetY"] + bounding_client_rect["top"]))
                    global_data_store.cover_frame.SetSize((html["width"], html["height"]))
                    global_data_store.cover_frame.SetWindowStyle(wx.STAY_ON_TOP)
                    global_data_store.cover_frame.Show()
                    browser_driver.execute_script('window["uiauto_selected_result"] = null')
                    browser_driver.switch_to.default_content()
                else:
                    iframe_list = browser_driver.find_elements_by_tag_name("iframe")
                    if html['index'] is not None and html['index'] > -1:
                        iframe = iframe_list[html['index'] - 1]
                        browser_driver.switch_to_frame(iframe)
                        inspect_js()
            return None
    
    if control.ClassName != "Chrome_RenderWidgetHostHWND" and control.GetTopLevelControl().ClassName != "IEFrame":
        global_data_store.cover_frame.SetPosition((control.BoundingRectangle.left, control.BoundingRectangle.top))
        global_data_store.cover_frame.SetSize((control.BoundingRectangle.width(), control.BoundingRectangle.height()))
        global_data_store.cover_frame.SetWindowStyle(wx.STAY_ON_TOP)
        global_data_store.cover_frame.Show()
        if control.Name != 'ui-selector-frame':
            global_data_store.target_control = control
            global_data_store.target_element = {
                "wnd": {
                    "control_type": control.ControlType,
                    "control_type_name": control.ControlTypeName,
                    "name": control.Name,
                    "class_name": control.ClassName,
                    "rect": {
                        "left": control.BoundingRectangle.left,
                        "right": control.BoundingRectangle.right,
                        "top": control.BoundingRectangle.top,
                        "bottom": control.BoundingRectangle.bottom,
                        "width": control.BoundingRectangle.width(),
                        "height": control.BoundingRectangle.height()
                    }
                }
            }



def listen_mouse_position():
    """
    监听鼠标坐标
    :return:
    """
    try:
        global global_data_store
        
        pythoncom.CoInitialize()

        pre_pos = None

        while True:
            try:
                control = uiautomation.ControlFromCursor()

                pos = uiautomation.GetCursorPos()
                
                if global_data_store.cover_frame is not None and not global_data_store.cover_frame.IsBeingDeleted():
                    if pre_pos is None:
                        pre_pos = pos
                        resize_native_cover_frame(control=control)
                    else:
                        abs_x = abs(pre_pos[0] - pos[0])
                        abs_y = abs(pre_pos[1] - pos[1])
                        if abs_x > 10 or abs_y > 10:
                            pre_pos = pos
                            global_data_store.cover_frame.Hide()
                        else:
                            pre_pos = pos
                            resize_native_cover_frame(control=control)

                time.sleep(0.05)
            except Exception as e:
                print(e)
    except Exception:
        sys.exit()


def remote_browser(browser):
    """
    远程控制浏览器
    :param browser:
    :return:
    """
    global browser_driver
    try:
        browser_driver = ResumeBrowser(command_executor=browser['executor_url'], session_id=browser['session_id'])
        # browser_driver = webdriver.Remote(command_executor=browser['executor_url'], desired_capabilities={})
        # browser_driver.session_id = browser['session_id']
        browser_driver.switch_to.default_content()
        inspect_js()
    except Exception as e:
        print("remote_browser>>>>>>>>>>>", e)
        browser_driver = None


def inspect_js():
    global browser_driver
    try:
        with open(os.path.split(os.path.realpath(__file__))[0] + '\\js\\cover_frame.js', 'rb') as f:
            js = str(f.read(), encoding='utf-8')
            browser_driver.execute_script(js)
    except Exception as e:
        print('inspect_js>>>>>>>>>>>>>', e)
        # browser_driver = None
        # raise e


def on_mouse_left_up(self):
    try:
        global global_data_store

        stop_thread(global_data_store.thread_listen_mouse)
        img_file_name = "element_" + str(time.time()) + ".png"
        img_file_dir = global_data_store.project_dir
        img_file_path = img_file_dir + img_file_name
        if os.path.exists(ResourcesInfo.screenshot_file):
            os.remove(path=ResourcesInfo.screenshot_file)
        if not os.path.exists(img_file_dir):
            os.makedirs(img_file_dir)
        self.Hide()
        msg = global_data_store.target_element
        
        msg['element_screenshot'] = img_file_name
        
        global_data_store.app.ExitMainLoop()

        if "wnd" in msg.keys():
            control = global_data_store.target_control
            im = ImageGrab.grab(bbox=(control.BoundingRectangle.left + 7, control.BoundingRectangle.top, \
                control.BoundingRectangle.left + control.BoundingRectangle.width() - 14, \
                control.BoundingRectangle.top + control.BoundingRectangle.height() - 7))
            im.save(img_file_path)
            msg['element_screenshot'] = img_file_name
        
        if "html" in msg.keys():
            html = msg['html']
            bounding_client_rect = html["bounding_client_rect"]
            im = ImageGrab.grab(bbox=(html["offsetX"] + bounding_client_rect["left"], \
                html["offsetY"] + bounding_client_rect["top"], \
                html["offsetX"] + bounding_client_rect["left"] + bounding_client_rect['width'], \
                html["offsetY"] + bounding_client_rect["top"] + bounding_client_rect['height']))
            im.save(img_file_path)
            msg['element_screenshot'] = img_file_name
        print("选择元素的结果：%s" % json.dumps(msg, ensure_ascii=False, indent=4))
        global_data_store.target_element = msg
        # self.app.ExitMainLoop()
    except Exception as e:
        global_data_store.app.ExitMainLoop()
        print(e)


def main(params):
    try:

        global global_data_store
        global browser_driver

        global_data_store = Global_Data_Store()

        if 'browsers' not in params or 'project_dir' not in params:
            print(ExecuteResult(success=False, message="缺少参数browsers").__dict__)
        else:

            global_data_store.app = wx.App()
            global_data_store.cover_frame = CoverFrame((0, 0), (100, 100), 100, (245, 108, 108), on_mouse_left_up)
            global_data_store.project_dir = params["project_dir"]
            # ResourcesInfo.init(cover_frame=cover_frame, project_dir=project_dir, screenshot_file=params["screenshot_file"])

            """
            启动鼠标监听进程
            """
            global_data_store.thread_listen_mouse = threading.Thread(target=listen_mouse_position)
            global_data_store.thread_listen_mouse.setDaemon(True)
            global_data_store.thread_listen_mouse.start()

            if browser_driver is not None:
                try:
                    browser_driver.switch_to.default_content()
                    inspect_js()
                except Exception as e:
                    print(e)

            # if len(params['browsers']) > 0:
            #     for browser in params['browsers']:
            #         if ('executor_url' not in browser) or ('session_id' not in browser) \
            #                 or (browser['executor_url'] == '') or (browser['session_id'] == ''):
            #             raise ValueError('browser数据传入异常：%s' % json.dumps(browser))
            #         else:
            #             remote_browser(browser)
                        # global_data_store.thread_remote_browser = threading.Thread(target=remote_browser(browser))
                        # global_data_store.thread_remote_browser.setDaemon(True)
                        # global_data_store.thread_remote_browser.start()

            global_data_store.app.MainLoop()
            print('选择器退出', datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
            return global_data_store.target_element
    except Exception as e:
        raise e


def open_browser(params):
    global browser_driver
    try:
        if browser_driver is not None:
            browser_driver.close()
            browser_driver.quit()

        executable_path = ""
        if params['browser_type'] == "Internet Explorer":
            executable_path = params["client_dir"] + "\\env\\webdriver\\win32\\IEDriverServer.exe"
            browser_driver = webdriver.Ie(executable_path=executable_path)

        if params['browser_type'] == "Chrome":
            option = webdriver.ChromeOptions()
            executable_path = params["client_dir"] + "\\env\\webdriver\\win32\\chromedriver.exe"
            browser_driver = webdriver.Chrome(executable_path=executable_path, chrome_options=option)

        executor_url = browser_driver.command_executor._url
        session_id = browser_driver.session_id
        params['executor_url'] = executor_url
        params['session_id'] = session_id

        print("open_browser>>>>>>>>>>", params)
        browser_driver.set_script_timeout(1)

        return params
    except Exception as e:
        print(browser_driver.capabilities['version'])
        print(e)


if __name__ == "__main__":
    sys.stdout = Logger(fileN="uiselector.log")
    param_file = sys.argv[1]
    with open(param_file, 'r', encoding='UTF-8') as params_file:
        params = json.loads(params_file.read())
    execute_result = main(params)
    with open(param_file.replace('.txt', '_result.txt'), 'w', encoding='UTF-8') as result_file:
        result_file.write(json.dumps(execute_result))
    
    # while True:
    #     shell_line = input().rstrip('\n')
    #     print('接收到的指令：%s' % shell_line)
    #     shell = shell_line.split(' ')
    #     if len(shell) == 0:
    #         print('选择器不接受空指令')
    #     else:
    #         if len(shell) >= 1:
    #             command = shell[0]
    #         if len(shell) >= 2:
    #             command_option = shell[1]

    #     if command == 'execute':
    #         with open(command_option, 'r', encoding='UTF-8') as params_file:
    #             params = json.loads(params_file.read())
    #         execute_result = main(params)
    #         with open(command_option.replace('.txt', '_result.txt'), 'w', encoding='UTF-8') as result_file:
    #             result_file.write(json.dumps(execute_result))
    #         # print(execute_result)
    #         # main({
    #         #     "browsers": [],
    #         #     "project_dir": "C:\\UiAuto\\projects\\demo\\screenshot\\",
    #         #     "screenshot_file": ""
    #         # })
    #     elif command == 'exit':
    #         sys.exit()
    #     else:
    #         print('不支持的指令：%s' % shell_line)
