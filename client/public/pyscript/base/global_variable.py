class GlobalVariable:
    environment_options: None
    running_params: None
    run_result: None

    @staticmethod
    def init():
        GlobalVariable.environment_options = None
        GlobalVariable.running_params = None
        GlobalVariable.run_result = None
