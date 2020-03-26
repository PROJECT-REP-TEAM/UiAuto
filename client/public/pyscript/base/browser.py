from selenium import webdriver
from selenium.webdriver.chrome import options
from selenium.common.exceptions import InvalidArgumentException


class ResumeBrowser(webdriver.Remote):
    """
    重新连接浏览器
    """

    def __init__(self, command_executor, session_id):
        self.r_session_id = session_id
        self.w3c = True
        webdriver.Remote.__init__(
            self, command_executor=command_executor, desired_capabilities={})

    def start_session(self, capabilities, browser_profile=None):
        """
        重写start_session方法
        """
        if not isinstance(capabilities, dict):
            raise InvalidArgumentException("Capabilities must be a dictionary")
        if browser_profile:
            if "moz:firefoxOptions" in capabilities:
                capabilities["moz:firefoxOptions"]["profile"] = browser_profile.encoded
            else:
                capabilities.update(
                    {'firefox_profile': browser_profile.encoded})

        self.capabilities = options.Options().to_capabilities()
        self.session_id = self.r_session_id

"""
生成xpath表达式
"""
def generate_xpath(html):
    xpath = ""
    if 'id' in html.keys() and html['id'] is not '' and html['id'] is not None:
        xpath = "@id='" + html['id'] + "'"
    else:
        if 'name' in html.keys() and html['name'] is not '' and html['name'] is not None:
            xpath = "@name='" + html['name'] + "'"
        elif 'class' in html.keys() and html['class'] is not '' and html['class'] is not None:
            xpath = "@class='" + html['class'] + "'"
        else:
            pass
        if 'text' in html.keys() and html['text'] != '' and html['text'] is not None:
            if xpath != "":
                xpath += " and "
            xpath += "contains(text(), '" + html['text'] + "')"
    xpath = "//" + html['tag'].lower() + "[" + xpath + "]"
    return xpath
