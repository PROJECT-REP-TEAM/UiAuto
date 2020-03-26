import wmi
import hashlib

def get_cpu_info():
    s = wmi.WMI()
    cpu = []
    cp = s.Win32_Processor()
    for u in cp:
        cpu.append({
            "Name": u.Name,
            "Serial Number": u.ProcessorId,
            "CoreNum": u.NumberOfCores
        })
    return cpu

def get_disk_info():
    s = wmi.WMI()
    disk = []
    for pd in s.Win32_DiskDrive():
        disk.append({
            # 获取硬盘序列号，调用另外一个win32 API
            "Serial": s.Win32_PhysicalMedia()[0].SerialNumber.lstrip().rstrip(),
            "ID": pd.deviceid,
            "Caption": pd.Caption,
            "size": str(int(float(pd.Size)/1024/1024/1024))+"G"
        })
    return disk

def get_network_info():
    s = wmi.WMI()
    network = []
    for nw in s.Win32_NetworkAdapterConfiguration():  # IPEnabled=0
        if nw.MACAddress != None:
            network.append({
                "MAC": nw.MACAddress,  # 无线局域网适配器 WLAN 物理地址
                "ip": nw.IPAddress
            })
    return network

def get_mainboard_info():
    s = wmi.WMI()
    mainboard = []
    for board_id in s.Win32_BaseBoard():
        mainboard.append(board_id.SerialNumber.strip().strip('.'))
    return mainboard

def get_bios_info():
    s = wmi.WMI()
    bioss = []
    for bios_id in s.Win32_BIOS():
        tmpmsg = {}
        tmpmsg['SerialNumber'] = bios_id.SerialNumber
        tmpmsg['BiosCharacteristics'] = bios_id.BiosCharacteristics  # BIOS特征码
        tmpmsg['version'] = bios_id.Version  # BIOS版本
        tmpmsg['Manufacturer'] = bios_id.Manufacturer.strip()  # BIOS固件生产厂家
        tmpmsg['ReleaseDate'] = bios_id.ReleaseDate  # BIOS释放日期
        tmpmsg['SMBIOSBIOSVersion'] = bios_id.SMBIOSBIOSVersion  # 系统管理规范版本
        bioss.append(tmpmsg)
    
    return bioss


def get_device_id(params):
    h = hashlib.sha1()
    cpu_infos = get_cpu_info()
    # disk_infos = get_disk_info()
    mainboard_infos = get_mainboard_info()
    network_infos = get_network_info()
    bios_infos = get_bios_info()

    deviceid = None
    if len(bios_infos) > 0 and len(cpu_infos) > 0:
        deviceid = bios_infos[0]["SerialNumber"].replace(" ", "") + "-" + cpu_infos[0]["Serial Number"]
        h.update(deviceid.encode("utf-8"))
        deviceid = h.hexdigest()
    return deviceid

if __name__ == "__main__":
    print(get_device_id(None))
