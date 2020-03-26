关于编码codec(index.py)：
若录屏选择XVID格式则不需要额外dll
若选择X264则需复制openh264-1.8.0-win32.dll到C:\Windows\SysWOW64\，(代码在index.py的initialization()函数里和move_dll.py)
dll下载地址：https://github.com/cisco/openh264/releases


XVID编码不需要额外dll，但所录的视频体积较大（1h时长大约1GB）
X264编码能最大限度压缩视频文件大小而清晰度不变（1h时长大约100+MB），但需要额外dll支持

录屏启动后可开启cmd弹窗供测试使用
把administrator_cmd.vbs中的
shell.ShellExecute path,"","","runas",0
改成
shell.ShellExecute path,"","","runas",1




