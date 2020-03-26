from global_variable import GlobalVariable
from selenium import webdriver
from selenium.webdriver.chrome import options
from selenium.common.exceptions import InvalidArgumentException
import json
import sys
import time

# executable_path = ""
# option = webdriver.ChromeOptions()
# executable_path = "Z:\\workspace\\legion\\code\\UiAuto\\client\\env\\webdriver\\win32\\chromedriver.exe"
# driver = webdriver.Chrome(executable_path=executable_path, chrome_options=option)


def main(params):
    global driver
    try:
        executable_path = ""
        environment_options = GlobalVariable.environment_options
        if params['browser_type'] == "Internet Explorer":
            executable_path = environment_options["client_dir"] + "\\env\\webdriver\\win32\\IEDriverServer.exe"
            driver = webdriver.Ie(executable_path=executable_path)

        if params['browser_type'] == "Chrome":
            option = webdriver.ChromeOptions()
            executable_path = environment_options["client_dir"] + "\\env\\webdriver\\win32\\chromedriver.exe"
            option.set_capability("pageLoadStrategy", "none")
            driver = webdriver.Chrome(executable_path=executable_path, chrome_options=option)

        executor_url = driver.command_executor._url
        session_id = driver.session_id
        params['executor_url'] = executor_url
        params['session_id'] = session_id

        GlobalVariable.run_result = params

        return params
    except Exception as e:
        driver = None
        raise e
