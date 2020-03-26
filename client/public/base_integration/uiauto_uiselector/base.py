import wx
import os
from selenium import webdriver
from selenium.webdriver.chrome import options
from selenium.common.exceptions import InvalidArgumentException
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from http.server import BaseHTTPRequestHandler
import threading
import websockets
import json

UI_SELECTOR_MODE_NATIVE = "native"
UI_SELECTOR_MODE_SELENIUM = "selenium"
UI_SELECTOR_MODE_HYBRID = "hybrid"


class ResourcesInfo:
    cover_frame = None
    project_dir = ""
    result = None
    screenshot_file = ""
    driver = None
    enabled_listen_mouse = True
    web_element = None

    @staticmethod
    def init(cover_frame, project_dir, screenshot_file):
        ResourcesInfo.cover_frame = cover_frame
        ResourcesInfo.project_dir = project_dir
        ResourcesInfo.screenshot_file = screenshot_file


class CoverFrame(wx.Frame):
    """
    遮罩层
    """

    def __init__(self, position, size, transparent, bg_color, on_mouse_left_up_event):
        wx.Frame.__init__(self, None, name="ui-selector-frame", pos=position, size=size,
                          style=wx.SIMPLE_BORDER | wx.TRANSPARENT_WINDOW | wx.STAY_ON_TOP | wx.FRAME_NO_TASKBAR)
        self.locale = wx.Locale(wx.LANGUAGE_ENGLISH)
        self.SetTransparent(transparent)
        self.SetBackgroundColour(bg_color)
        self.Bind(wx.EVT_LEFT_UP, self.mouse_left_up_event)
        self.on_mouse_left_up_event = on_mouse_left_up_event

    def mouse_left_up_event(self, event):
        self.on_mouse_left_up_event(self)


class ResumeBrowser(webdriver.Remote):
    """
    重新连接浏览器
    """

    def __init__(self, command_executor, session_id):
        cap = DesiredCapabilities.INTERNETEXPLORER
        print(cap)
        cap['loggingPrefs'] = {'browser': 'ALL'}
        self.r_session_id = session_id
        self.w3c = True
        webdriver.Remote.__init__(self, command_executor=command_executor, desired_capabilities={})

    def start_session(self, capabilities, browser_profile=None):
        """
        重写start_session方法
        """
        if not isinstance(capabilities, dict):
            raise InvalidArgumentException("Capabilities must be a dictionary")
        if browser_profile:
            if "moz:firefoxOptions" in capabilities:
                capabilities["moz:firefoxOptions"]["profile"] = browser_profile.encoded
            else:
                capabilities.update({'firefox_profile': browser_profile.encoded})

        self.capabilities = options.Options().to_capabilities()
        self.session_id = self.r_session_id


class JavascriptRequest(BaseHTTPRequestHandler):
    """
    资源请求类
    """

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/javascript')
        self.end_headers()
        print(self.path)
        try:
            with open(os.path.split(os.path.realpath(__file__))[0] + self.path.replace('/', '\\\\'), 'rb') as f:
                content = f.read()
                self.wfile.write(content)
        except IOError:
            self.send_error(404, 'File Not Found: %s' % self.path)


class ExecuteResult:
    """
    执行结果类
    """

    def __init__(self, success=True, code=0, message=None, data=None, error=None):
        self.success = success
        self.code = code
        self.message = message
        self.data = data
        self.error = error


class WebsocketClient:


    def __init__(self, uri, thread_msg_queue, on_mouse_left_up, cover_frame):
        self._running = True
        self.thread_msg_queue = thread_msg_queue
        self.on_mouse_left_up = on_mouse_left_up
        self.cover_frame = cover_frame
        self.uri = uri

    def terminate(self):
        self._running = False

    def start_socket_client(self):
        pass
    
    async def respond_websocket(self):
        """
        websocket 响应方法
        :param websocket:
        :param path:
        :return:
        """
        async with websockets.connect(self.uri) as websocket:
            await websocket.send(json.dumps({'client': 'python'}))
            while self._running == True:
                msg = await websocket.recv()
                msg = msg.encode("gbk", 'ignore').decode("gbk", "ignore")
                msg = json.loads(msg)
                self.thread_msg_queue.put(msg)
                self.on_mouse_left_up(self.cover_frame, None)
                print(msg)
                break