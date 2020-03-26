import uiautomation
import time
from pykeyboard import *
from ctypes import *
import win32api
import win32con

k = PyKeyboard()

key_code = {
    "1": "", "2": "", "3": "", "4": "", "5": "", "6": "", "7": "", "8": "", "9": "0", "`": "", "": "", 
    "": "", "": "", "": "", "": "", "": "", "": "", "": "", 
}


if __name__ == "__main__":
    time.sleep(5)
    # h.keybd_event(0x41, 0x1e, 0x0000, 0); 
    # win32api.keybd_event(32, 0, 0, 0)
    # time.sleep(3)
    # win32api.keybd_event(0x41, 0, 0, 0)
    # win32api.keybd_event(0x41, 0, win32con.KEYEVENTF_KEYUP, 0)
    # h.MessageBoxW(0, u'内容', u'标题', 0)
    # k.type_string("123456")

    control = uiautomation.ControlFromCursor()
    # control = uiautomation.Control(Class="")
    control.Click()

    h = windll.LoadLibrary(".\\DD94687.32.dll")
    h.DD_key(401, 1)
    h.DD_key(401, 1)
    h.DD_key(401, 1)
    h.DD_key(401, 1)
    h.DD_key(401, 1)
    h.DD_key(401, 1)
    h.DD_key(401, 1)
    # control.Hide()
    # control.SendKeys('123456')
    print(control)
    # print(dir(control))
    # print(control.GetChildren())