# 全局公共变量存取
global_data_store = None

# 初始化
def __init():
    global global_data_store
    global_data_store = {}

# 设置值
def set_value(key, value, readonly=False):
    if key in global_data_store.keys() and global_data_store[key]["readonly"] is True:
        raise Exception("不允许修改只读变量")

    global_data_store[key] = {
        "readonly": readonly,
        "value": value
    }

# 取值
def get_value(key):
    return global_data_store[key]["value"]

# 获取所有值
def get_all():
    all_data = {}
    for key in global_data_store.keys():
        all_data[key] = global_data_store[key]["value"]
    return all_data

# 移除值
def delete(key):
    global_data_store.pop(key)

# 清空存取
def clear():
    global_data_store.clear()

# 更新多个变量
def update(variable = {}, readonly=False):
    for key in variable.keys():
        set_value(key=key, value=variable[key], readonly=readonly)