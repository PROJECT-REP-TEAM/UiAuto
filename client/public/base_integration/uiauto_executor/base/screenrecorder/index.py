# -*- coding: utf-8 -*-
# @Time : 2019/8/11 14:44
# @Author : WangS
import win32api
import socket
import json
import time
import sys
import os
dir_path = os.path.split(os.path.realpath(__file__))[0]
sys.path.append(os.path.join(dir_path, 'site-packages'))
import traceback
import cv2
import numpy as np
import pyautogui as pag
from PIL import ImageGrab
import threading

save_path = ''
codec = 'XVID'  # 不需要dll的录屏视频编码
status = 'start'


# uiauto的运行权限不足，故本插件在cmd中调用shell.vbs，获取管理员权限的cmd，然后在管理员cmd中调用执行录屏脚本的bat文件
def run_admin_cmd(cmd, timeout=10):
    # 创建执行录屏脚本的bat文件
    f = None
    try:
        bat = sys.path[0] + r"\cmd_command.bat"
        if os.path.isfile(bat):
            os.remove(bat)
        f = open(bat, 'w')
        f.write(cmd)
    except Exception as e:
        traceback.print_exc()
        raise e
    finally:
        if f:
            f.close()
    # 调用shell.vbs开启管理员权限的cmd执行bat
    try:
        win32api.ShellExecute(0, 'open', bat, '', '', 0)
    except Exception as e:
        raise e


# 初始化配置
def initialization(params):
    # 保存路径判断
    global save_path
    if 'save_path' in params.keys():
        if params['save_path']:
            dir = params['save_path']
    else:
        dir = dir_path
    try:
        video_dir = os.path.join(dir, time.strftime("%F"))
        # 不存在则创建目录
        if not os.path.exists(video_dir):
            os.makedirs(video_dir)
        save_path = video_dir + '\\' + time.strftime("%F_%H_%M_%S") + '.avi'
    except:
        print('save_path creation failed')
        return 'save_path creation failed'
    # 复制编码库文件l
    if codec == 'X264':
        move_dll_cmd = str(sys.executable) + " " + dir_path + "\\move_dll.py"
        dll_path = r'C:\Windows\SysWOW64\openh264-1.8.0-win32.dll'
        # 若不存在dll则复制dll
        if not os.access(dll_path, os.F_OK):
            run_admin_cmd(move_dll_cmd)  # 使用管理员权限运行move_dll.py
        time.sleep(1)  # 等待dll移动完成
    print("save_path create in:", save_path)
    return save_path


# 开始录屏
def start(params):
    global status
    fps = 10
    save_path = initialization(params)  # 初始化配置
    video = create_video(path=save_path)
    recording(video, fps, status)
    # 结束时释放资源
    video.release()
    return video


# 结束录屏
def end():
    global status
    status = 'stop'


# 创建视频
def create_video(path):
    px = ImageGrab.grab()  # 获取全屏信息
    width, high = px.size  # 获得当前屏幕的大小
    fps = 5  # 录屏帧数
    # fourcc = cv2.VideoWriter_fourcc(*'{}'.format(codec))
    fourcc = cv2.VideoWriter_fourcc(*('X', 'V', 'I', 'D'))
    video = cv2.VideoWriter(path, fourcc, fps, (width, high))
    return video


def recording(video, fps, status):
    second = 0
    while True:
        start_time = time.time()
        second += 1
        for i in range(0, fps):
            captureImage = ImageGrab.grab()  # 抓取屏幕
            frame = cv2.cvtColor(np.array(captureImage), cv2.COLOR_RGB2BGR)
            video.write(frame)

        # 退出条件
        if status == 'stop':
            break
        print('录制秒数：', second)


if __name__ == '__main__':
    sys.stderr.write(sys.argv[1])
    save_path = sys.argv[1]
    start({
        'save_path': save_path
    })
    # start({
    #     'save_path': r'C:\demo_data'
    # })