
import ctypes
import os
from PIL import ImageGrab, Image
import sys
import time


def UI_Screenshot(params):
    if 'image_path' in params.keys() and params['image_path'] is not None:
        if os.path.exists(params['image_path']) == True:
            os.remove(params['image_path'])

    if 'path' in params.keys() and params['path'] is not None:
        if os.path.exists(params['path']) == False:
            os.mkdir(params['path'])
        params['path'] = params['path'] + time.strftime("%F")
        if os.path.exists(params['path']) == False:
            os.mkdir(params['path'])
    else:
        return 'There is no path to save'

    # 加载微信截图dll
    print(os.path.split(os.path.realpath(__file__))[0] + '\\PrScrn.dll')
    dll = ctypes.cdll.LoadLibrary(os.path.split(
        os.path.realpath(__file__))[0] + '\\PrScrn.dll')
    dll.PrScrn(0)
    if isinstance(ImageGrab.grabclipboard(), Image.Image):
        save_path = params['path'] + '\\' + time.strftime("%F_%H_%M_%S") + '.png'
        ImageGrab.grabclipboard().save(save_path)
        return save_path
    else:
        return ""