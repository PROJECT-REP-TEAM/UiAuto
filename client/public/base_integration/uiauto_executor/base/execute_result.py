import json

class MyEncoder(json.JSONEncoder):

    def default(self, obj):
    
        if isinstance(obj, bytes):
            return str(obj, encoding='utf-8')
        elif type(obj).__name__ == 'classobj':
            print(">>>>>>>>>>>>>>>>>>>>>>")
            return obj.__dict__
        elif isinstance(obj, list):
            new_obj = []
            for o in obj:
                new_obj.append(default(self, o))
            return new_obj
        
        return json.JSONEncoder.default(self, obj)


class ExecuteResult:
    """
    执行结果类
    """

    def __init__(self, success=True, code=0, message=None, data=None, error=None, params=None):
        self.success = success
        self.code = code
        self.message = message
        self.data = data
        self.error = error
        self.params = params
        self.failed_nodes = ''
        

    def to_string(self):
        try:
            return json.dumps({
                "success": self.success,
                "code": self.code,
                "message": self.message,
                "data": self.data,
                "error": self.error,
                "params": self.params,
                "failed_nodes": self.failed_nodes
            }, ensure_ascii=False, indent=4, cls=MyEncoder)
        except Exception as e:
            print(e)