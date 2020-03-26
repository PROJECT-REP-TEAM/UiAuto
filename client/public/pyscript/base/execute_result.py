import json

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

    def to_string(self):
        return json.dumps({
            "success": self.success,
            "code": self.code,
            "message": self.message,
            "data": self.data,
            "error": self.error,
            "params": self.params
        }, ensure_ascii=False, indent=4)