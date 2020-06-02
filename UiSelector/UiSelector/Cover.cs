using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using System.Runtime.InteropServices;
using System.Threading;
using UiSelector.handler;
using System.Windows.Automation;
using System.Windows;
using Newtonsoft.Json;
using SHDocVw;
using mshtml;
using System.Diagnostics;
using UiSelector.entity;
using System.Drawing.Imaging;
using System.Collections;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Remote;
using Newtonsoft.Json.Linq;
using UiSelector.utils;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.Extensions;

namespace UiSelector
{
    public partial class Cover : Form
    {

        [DllImport("user32.dll")]
        public static extern IntPtr FindWindowEx(IntPtr hwndParent, IntPtr hwndChildAfter, string lpszClass, string lpszWindow);
        [DllImport("user32.dll")]
        private static extern int SendMessage(IntPtr hwnd, int wMsg, int wParam, StringBuilder lParam);

        [DllImport("user32.dll", EntryPoint = "SendMessage")]
        public static extern int SendMessage(IntPtr hwnd, int wMsg, uint wParam, uint lParam);

        [DllImport("user32.dll", EntryPoint = "GetWindowLong")]
        public static extern long GetWindowLong(IntPtr hwnd, int nIndex);
        [DllImport("user32.dll", EntryPoint = "SetWindowLong")]
        public static extern long SetWindowLong(IntPtr hwnd, int nIndex, long dwNewLong);
        [DllImport("user32.dll", EntryPoint = "SetLayeredWindowAttributes")]
        public static extern int SetLayeredWindowAttributes(IntPtr Handle, int crKey, byte bAlpha, int dwFlags);

        //调用API
        [DllImport("user32.dll", CharSet = System.Runtime.InteropServices.CharSet.Auto, ExactSpelling = true)]
        public static extern IntPtr GetForegroundWindow(); //获得本窗体的句柄
        [DllImport("user32.dll", EntryPoint = "SetForegroundWindow")]
        public static extern bool SetForegroundWindow(IntPtr hWnd);//设置此窗体为活动窗体

        [DllImport("kernel32.dll", SetLastError = true)]
        [return: System.Runtime.InteropServices.MarshalAs(System.Runtime.InteropServices.UnmanagedType.Bool)]
        static extern bool AllocConsole();

        [DllImport("user32.dll", EntryPoint = "WindowFromPoint")]//指定坐标处窗体句柄
        public static extern IntPtr WindowFromPoint(System.Windows.Point point);

        [DllImport("user32.dll", EntryPoint = "FindWindow")]//指定坐标处窗体句柄
        public static extern int FindWindow(string lpClassName, string lpWindowName);

        [System.Runtime.InteropServices.DllImport("user32.dll")]
        internal static extern bool SetProcessDPIAware();

        //获取类的名字
        [DllImport("user32.dll")]
        private static extern int GetClassName(IntPtr hWnd, StringBuilder lpString, int nMaxCount);


        [System.Runtime.InteropServices.DllImport("Kernel32")]
        public static extern void FreeConsole();

        const int GWL_EXSTYLE = -20;
        const int WS_EX_TRANSPARENT = 0x20;
        const int WS_EX_LAYERED = 0x80000;
        const int LWA_ALPHA = 2;


        MouseHook mh;
        AutomationElement selectedElement = null;
        IHtml selectedHtml = null;
        Dictionary<int, ArrayList> IEBrowserMap = new Dictionary<int, ArrayList>();
        IWebDriver ChromeDriver = null;
        string ElementType = "Native";// IE Chrome
        ArrayList ChromeDriverList = new ArrayList();
        JsonSerializerSettings jsonSetting = new JsonSerializerSettings();


        public struct CursorPoint
        {
            public int X;
            public int Y;
        }

        [System.Runtime.InteropServices.DllImport("user32.dll")]
        internal static extern bool GetPhysicalCursorPos(ref CursorPoint lpPoint);



        private void mh_MouseClickEvent(object sender, MouseEventArgs e)
        {
            MessageBox.Show(e.X + "-" + e.Y);
        }

        private void mh_MouseMoveEvent(object sender, MouseEventArgs e)
        {
            SetForegroundWindow(this.Handle);

            int x = e.Location.X;
            int y = e.Location.Y;
            String label_text = "x: " + x + ", y: " + y;
            //screenPoint = new System.Drawing.Point(x, y);
            informationForm.UpdateLabelMousePosition(label_text);

        }

        Information informationForm = new Information();
        Thread selectThread = null;
        JObject inputParams = null;
        string chromejs = "";
        string mousejs = "";
        bool isChrome = false;
        UIAutoSocket.SocketBehavior CurrentSocket = null;
        //System.Drawing.Point screenPoint = new System.Drawing.Point(0, 0);

        public Cover(IWebDriver driver)
        {

            SetProcessDPIAware();

            jsonSetting.Formatting = Formatting.Indented;

            this.ChromeDriver = driver;

            UIAutoSocket.RegisterMessageCallback(this.OnSocketMessage);

            string str = System.IO.Directory.GetCurrentDirectory();
            if (System.IO.Directory.Exists(str + "\\public") == false)
            {
                //chromejs = System.IO.File.ReadAllText("chrome.js");
                //mousejs = System.IO.File.ReadAllText("mouse.js");
            }
            else
            {
                //chromejs = System.IO.File.ReadAllText(str + "/public/base_integration/uiauto_uiselector/chrome.js");
                //mousejs = System.IO.File.ReadAllText(str + "/public/base_integration/uiauto_uiselector/mouse.js");
            }

            //System.Console.WriteLine("Contents of WriteText.txt = {0}", chromejs);

            //InitChromeMouseEvent();

            InitializeComponent();
            Control.CheckForIllegalCrossThreadCalls = false;

            //mh = new MouseHook();
            //mh.SetHook();
            //mh.MouseMoveEvent += mh_MouseMoveEvent;
            //mh.MouseClickEvent += mh_MouseClickEvent;

            informationForm.Visible = true;

        }

        private void OnSocketMessage(string ID, string Result)
        {
            CurrentSocket = UIAutoSocket.SocketBehaviorMap[ID] as UIAutoSocket.SocketBehavior;

            var res = JsonConvert.DeserializeObject<Dictionary<string, object>>(Result);
            switch (res["event"])
            {
                case "CHECK":
                    isChrome = (bool)res["data"];
                    break;
                case "UI":
                    // Console.WriteLine("OnSocketMessage>>>>>>>>" + Result);
                    if (res["data"] != null)
                    {
                        selectedHtml = JsonConvert.DeserializeObject<IHtml>((string) res["data"]);
                        int el_x = (int)(selectedHtml.left);
                        int el_y = (int)(selectedHtml.top);
                        this.Location = new System.Drawing.Point(el_x, el_y);
                        this.Size = new System.Drawing.Size(selectedHtml.width, selectedHtml.height);
                        this.Visible = true;
                        this.informationForm.SetElementTag(selectedHtml.tag);
                    }
                    else
                    {
                        selectedHtml = null;
                    }
                    break;
            }
        }

        private void jsRun(InternetExplorer Browser, String str)
        {
            /*HTMLDocument doc = Browser.Document as HTMLDocument;
            HTMLScriptElement script = (HTMLScriptElement)doc.createElement("script");
            Console.WriteLine(doc.elementFromPoint(100, 100));
            script.text = str;
            HTMLBody body = doc.body as HTMLBody;
            body.appendChild((IHTMLDOMNode)script);*/
            HTMLDocument doc = Browser.Document as HTMLDocument;

        }

        private void RealMousePosition()
        {
            System.Drawing.Point prePoint = new System.Drawing.Point(-1, -1);
            bool selectLock = false;
            while (true)
            {
                //System.Drawing.Point screenPoint = Control.MousePosition;
                CursorPoint cursorPos = new CursorPoint();
                GetPhysicalCursorPos(ref cursorPos);
                System.Drawing.Point screenPoint = new System.Drawing.Point(cursorPos.X, cursorPos.Y);
                //Console.WriteLine("鼠标在屏幕上的位置：" + screenPoint.X + " " + screenPoint.Y);

                if (Math.Abs(prePoint.X - screenPoint.X) <= 10 && Math.Abs(prePoint.Y - screenPoint.Y) <= 10)
                {
                    if (!selectLock)
                    {
                        selectLock = true;
                        System.Windows.Point point = new System.Windows.Point(screenPoint.X, screenPoint.Y);
                        selectedElement = AutomationElement.FromPoint(point);
                        AutomationElement.AutomationElementInformation currentControl = selectedElement.Current;
                        //Console.WriteLine(selectedElement.Current.Name);

                        IntPtr handle = WindowFromPoint(point);//得到窗口句柄
                        StringBuilder className = new StringBuilder(256);
                        GetClassName(handle, className, className.Capacity);//得到窗口的句柄

                        Process process = Process.GetProcessById(selectedElement.Current.ProcessId);
                        //Console.WriteLine(className + " " + selectedElement.Current.Name + " " + selectedElement.Current.ClassName);


                        PointInChrome pointInChrome = null;
                        IWebDriver CurrentDriver = null;
                        /*if (ChromeDriver != null && process.ProcessName == "chrome")
                        {
                            var mousePosition = ChromeDriver.ExecuteJavaScript<string>("return JSON.stringify(window['mousePosition'])");
                            pointInChrome = JsonConvert.DeserializeObject<PointInChrome>(mousePosition);
                            //Console.WriteLine("mousePosition>>>>>>>>>>" + pointInChrome.X + " " + pointInChrome.Y);

                        }*/

                        /*Console.WriteLine(process.MainWindowTitle);
                        if (process.ProcessName == "chrome")
                        {
                            AutomationElement el = AutomationElement.FromHandle(process.MainWindowHandle);
                            AutomationElement children = el.FindFirst(TreeScope.Subtree,
                                new PropertyCondition(AutomationElement.NameProperty, "地址和搜索栏"));
                            // Console.WriteLine("chromehandle >>>> " + collection);
                            string Url = "";
                            string Title = process.MainWindowTitle;
                            if (children != null)
                            {
                                object patternObj;
                                if (children.TryGetCurrentPattern(ValuePattern.Pattern, out patternObj))
                                {
                                    var valuePattern = (ValuePattern)patternObj;
                                    Url = valuePattern.Current.Value;
                                    Console.WriteLine(">>>>>" + Url);
                                }
                            }
                            CurrentDriver = SwitchToCurrentChrome(Title, Url);

                            if (CurrentDriver != null)
                            {
                                var mousePosition = ChromeDriver.ExecuteJavaScript<string>("return JSON.stringify(window['mousePosition'])");
                                pointInChrome = JsonConvert.DeserializeObject<PointInChrome>(mousePosition);
                            }
                        }*/
                        if (process.ProcessName == "chrome" && isChrome && UIAutoSocket.CureentSocketBehavior != null)
                        {
                            ElementType = "Chrome";
                            int x = (int)(screenPoint.X);
                            int y = (int)(screenPoint.Y);
                            var msg = new Dictionary<string, object>();
                            msg.Add("event", "UI");
                            var data = new Dictionary<string, object>();
                            data.Add("x", x);
                            data.Add("y", y);
                            msg.Add("data", data);
                            UIAutoSocket.CureentSocketBehavior.SendMessage(JsonConvert.SerializeObject(msg));


                            /*var result = CurrentDriver.ExecuteJavaScript<string>(chromejs, x, y);
                           
                            
                            if (result != null)
                            {
                                chromeHtml = JsonConvert.DeserializeObject<IHtml>(result);
                                int el_x = (int)(selectedElement.Current.BoundingRectangle.X + chromeHtml.left);
                                int el_y = (int)(selectedElement.Current.BoundingRectangle.Y + chromeHtml.top);
                                this.Location = new System.Drawing.Point(el_x, el_y);
                                this.Size = new System.Drawing.Size(chromeHtml.width, chromeHtml.height);
                                this.Visible = true;
                                this.informationForm.SetElementTag(chromeHtml.tag);
                            } else
                            {
                                chromeHtml = null;
                            }*/
                        } 
                        else
                        {
                            if (!IEBrowserMap.ContainsKey(selectedElement.Current.ProcessId))
                            {

                                ElementType = "Native";
                                this.Location = new System.Drawing.Point((int)currentControl.BoundingRectangle.Left, (int)currentControl.BoundingRectangle.Top);
                                this.Size = new System.Drawing.Size((int)currentControl.BoundingRectangle.Width, (int)currentControl.BoundingRectangle.Height);
                                this.Visible = true;
                                //为Native元素时置空Html元素选择对象
                                selectedHtml = null;
                                this.informationForm.SetElementTag(currentControl.ControlType.ProgrammaticName);
                            }
                            else
                            {
                                ElementType = "IE";
                                ArrayList ieList = IEBrowserMap[selectedElement.Current.ProcessId];

                                IEBrowser currentBrowser = null;
                                foreach (IEBrowser ie in ieList)
                                {
                                    if (!ie.IsHidden)
                                    {
                                        currentBrowser = ie;
                                    }
                                }

                                AutomationElement el = currentBrowser.Element;
                                InternetExplorer Browser = currentBrowser.Browser;

                                ArrayList FrameWindows = currentBrowser.FrameWindows;
                                int x = (int)(screenPoint.X - el.Current.BoundingRectangle.X);
                                int y = (int)(screenPoint.Y - el.Current.BoundingRectangle.Y);
                                //Console.WriteLine(String.Format(">>>x: {0}, y: {1}", screenPoint.X, screenPoint.Y));
                                //Console.WriteLine(String.Format("x: {0}, y: {1}", x, y));
                                HTMLDocument doc = Browser.Document as HTMLDocument;
                                float Radio = currentBrowser.Radio;
                                selectedHtml = GetSelectedHtmlElement(doc, x, y, FrameWindows, Radio);
                                var element = selectedHtml.element;
                                var documentElement = (doc as IHTMLDocument3).documentElement as IHTMLElement2;
                                selectedHtml.left -= documentElement.scrollLeft;
                                selectedHtml.top -= documentElement.scrollTop;
                                if (element != null)
                                {
                                    int el_x = (int) (el.Current.BoundingRectangle.X + selectedHtml.left * Radio);
                                    int el_y = (int) (el.Current.BoundingRectangle.Y + selectedHtml.top * Radio);
                                    this.Location = new System.Drawing.Point(el_x, el_y);
                                    this.Size = new System.Drawing.Size((int) (element.offsetWidth * Radio), (int) (element.offsetHeight * Radio));
                                    this.Visible = true;
                                    this.informationForm.SetElementTag(element.tagName.ToLower());
                                }

                            }
                        }
                        
                    }
                } 
                else
                {
                    selectLock = false;
                    this.Visible = false;
                    prePoint = screenPoint;
                }
                

                Thread.Sleep(100);
            }
        }

        private void InitChromeMouseEvent()
        {
            if (ChromeDriver != null)
            {
                Console.WriteLine(ChromeDriver.WindowHandles.Count);
                string currentHandle = ChromeDriver.CurrentWindowHandle;
                foreach (string winHandle in ChromeDriver.WindowHandles)
                {
                    IWebDriver driver = ChromeDriver.SwitchTo().Window(winHandle);
                    IChromeDriver cd = new IChromeDriver();
                    cd.WindowTitle = driver.Title + " - Google Chrome";
                    cd.Url = driver.Url.Replace("https://", "").Replace("http://", "").Replace("www.", "").TrimEnd('/');
                    cd.Driver = driver;
                    driver.ExecuteJavaScript(mousejs);

                    ChromeDriverList.Add(cd);

                    Console.WriteLine(cd.WindowTitle + " " + cd.Url);
                }

                ChromeDriver.SwitchTo().Window(currentHandle);
            }
            
        }

        private IWebDriver SwitchToCurrentChrome(string Title, string Url)
        {
            IWebDriver CurrentDriver = null;
            if (ChromeDriverList.Count > 0)
            {
                foreach (IChromeDriver cd in ChromeDriverList)
                {
                    if (cd.WindowTitle == Title && cd.Url == Url)
                    {
                        CurrentDriver = cd.Driver;
                    }
                }
            } else
            {
                string currentHandle = "";
                foreach (string winHandle in ChromeDriver.WindowHandles)
                {
                    IWebDriver driver = ChromeDriver.SwitchTo().Window(winHandle);
                    IChromeDriver cd = new IChromeDriver();
                    cd.WindowTitle = driver.Title + " - Google Chrome";
                    cd.Url = driver.Url.Replace("https://", "").Replace("http://", "").Replace("www.", "").TrimEnd('/');
                    cd.Driver = driver;
                    driver.ExecuteJavaScript(mousejs);

                    ChromeDriverList.Add(cd);

                    if (cd.WindowTitle == Title && cd.Url == Url)
                    {
                        currentHandle = winHandle;
                        CurrentDriver = driver;
                    }
                }

                if (currentHandle != "")
                {
                    ChromeDriver.SwitchTo().Window(currentHandle);
                }
                
            }

            return CurrentDriver;
        }

        private bool DocumentIsHidden(HTMLDocument doc)
        {
            doc.parentWindow.execScript("function GetDocumentHidden() { return document.hidden }");
            Type scriptType = doc.Script.GetType();

            bool returnValue = (bool)scriptType.InvokeMember("GetDocumentHidden", System.Reflection.BindingFlags.InvokeMethod, null, doc.Script, null);

            return returnValue;
        }

        private float DetectZoom(HTMLDocument doc)
        {
            HTMLScreen screen = (HTMLScreen) doc.parentWindow.screen;
            
            return (float) screen.deviceXDPI / screen.logicalXDPI;
        }

        private IHtml GetSelectedHtmlElement(HTMLDocument doc, int x, int y, ArrayList FrameWindows, float Radio)
        {
            //Console.WriteLine("screen radio:" + Radio);
            IHtml html = new IHtml();
            html.element = doc.elementFromPoint((int)(x / Radio), (int)(y / Radio));
            var element = html.element;
            try
            {
                //Console.WriteLine(html);
                //Console.WriteLine(html.tagName);
                if (element != null)
                {
                    html.left = UIElement.GetLeft(element);
                    html.top = UIElement.GetTop(element);

                    /*if (element.tagName.ToLower() == "area")
                    {
                        //selectedHtml = html.element;
                        HTMLDocument mapDoc = element.parentElement.parentElement.document as HTMLDocument;
                        IHTMLElementCollection els = mapDoc.getElementsByTagName("img");
                        if (els.length > 0)
                        {
                            html.element = els.item(null, 0);
                        }
                    }*/

                    if (element.tagName.ToLower() == "iframe")
                    {
                        HtmlFrame frame = new HtmlFrame();
                        frame.xpath = UIElement.GenerateXPath(element, false);
                        frame.full_xpath = UIElement.GenerateXPath(element, true);
                        html.frame = frame;
                        FrameWindow frameWin = null;
                        if (FrameWindows.Count > 0)
                        {
                            frameWin = FrameWindows[0] as FrameWindow;
                        }

                        if (frameWin != null)
                        {
                            var temp = frameWin.Document.documentElement as IHTMLElement2;
                            html.left -= temp.scrollLeft ;
                            html.top -= temp.scrollTop;
                            var nextHtml = GetSelectedHtmlElement(frameWin.Document, x - element.offsetLeft, y - element.offsetTop, frameWin.Children, Radio);
                            html.frame.next_frame = nextHtml.frame;
                            html.element = nextHtml.element;
                            html.left += nextHtml.left;
                            html.top += nextHtml.top;

                        }
                    }

                    element = html.element;
                    html.id = element.id;
                    html.tag = element.tagName.ToLower();
                    html.text = element.innerText;
                }
                else
                {
                    selectedHtml = null;
                }
            }
            catch (Exception e)
            {
                //Console.WriteLine(e.StackTrace);
            }
            

            return html;
        }

        private void Cover_Load(object sender, EventArgs e)
        {
            //SetWindowLong(Handle, GWL_EXSTYLE, GetWindowLong(Handle, GWL_EXSTYLE) |WS_EX_TRANSPARENT | WS_EX_LAYERED);
            SetLayeredWindowAttributes(Handle, 0, 128, LWA_ALPHA);

            InitBrowserObject();

            selectThread = new Thread(new ThreadStart(this.RealMousePosition));
            selectThread.IsBackground = true;
            selectThread.Start();


        }

        private void RemoteChromeDriver(Uri url, string sessionid)
        {
            try
            {
                OpenQA.Selenium.Chrome.ChromeOptions options = new OpenQA.Selenium.Chrome.ChromeOptions();
                //Console.WriteLine(options.UseSpecCompliantProtocol);
                var driver = new ReuseWebDriver(url, sessionid, options);
                //Console.WriteLine(driver.Capabilities.GetCapability("w3c"));
                IJavaScriptExecutor js = driver as IJavaScriptExecutor;
                js.ExecuteScript("console.log(1)");
            }
            catch (Exception ex)
            {
                Console.WriteLine("连接Chrome出错：" + ex.StackTrace);
            }
        }

        /// <summary>
        /// 初始化IE浏览器对象
        /// </summary>
        private void InitBrowserObject()
        {
            ShellWindows shellWindows = new ShellWindows();

            if (shellWindows.Count > 0)
            {
                //Console.WriteLine(String.Format("存在{0}个IE浏览器窗口", shellWindows.Count));

                foreach(InternetExplorer Browser in shellWindows)
                {
                    
                    if (Browser.Document is HTMLDocument)
                    {
                        HTMLDocument doc = Browser.Document;
                        ArrayList wins = FrameWindow.DealIframeWindowTree(doc);

                        AutomationElement winEelement = AutomationElement.FromHandle((IntPtr)Browser.HWND);

                        if (winEelement != null)
                        {
                            // 在子控件中查找出窗格类控件
                            AutomationElementCollection childElements = winEelement.FindAll(TreeScope.Children,
                                new PropertyCondition(AutomationElement.ControlTypeProperty, ControlType.Pane));

                            if (childElements.Count > 0)
                            {
                                foreach(AutomationElement el in childElements)
                                {
                                    AutomationElementCollection childElements2 = el.FindAll(TreeScope.Children,
                                        new PropertyCondition(AutomationElement.ClassNameProperty, "TabWindowClass"));

                                    if (childElements2.Count > 0)
                                    {
                                        foreach(AutomationElement el2 in childElements2)
                                        {
                                            //Console.WriteLine(JsonConvert.SerializeObject(el2.Current));
                                            ArrayList list = null;
                                            if (!IEBrowserMap.ContainsKey(el2.Current.ProcessId))
                                            {
                                                list = new ArrayList();
                                            }
                                            else
                                            {
                                                list = IEBrowserMap[el2.Current.ProcessId];
                                                IEBrowserMap.Remove(el2.Current.ProcessId);
                                            }

                                            IEBrowser ieBrowser = new IEBrowser();
                                            ieBrowser.Browser = Browser;
                                            ieBrowser.Element = el2;
                                            ieBrowser.Processid = winEelement.Current.ProcessId;
                                            ieBrowser.ContentProcessid = el2.Current.ProcessId;
                                            ieBrowser.FrameWindows = wins;
                                            ieBrowser.Radio = DetectZoom(doc);
                                            ieBrowser.IsHidden = DocumentIsHidden(doc);
                                            list.Add(ieBrowser);

                                            IEBrowserMap.Add(el2.Current.ProcessId, list);

                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            else
            {
                //Console.WriteLine("没有打开的IE窗口");
            }
        }

        private Bitmap SaveImage(int x, int y, int width, int height)
        {
            //创建图象，保存将来截取的图象
            Bitmap image = new Bitmap(width, height);
            Graphics imgGraphics = Graphics.FromImage(image);
            //设置截屏区域
            imgGraphics.CopyFromScreen(x, y, 0, 0, new System.Drawing.Size(width, height));
            image.Save("img.png", ImageFormat.Png);

            return image;
        }

        private void Cover_MouseClick(object sender, MouseEventArgs e)
        {
            try
            {
                this.Visible = false;

                UIElement uie = new UIElement();


                uie.system.DesktopSize = PrimaryScreen.DESKTOP;
                //Console.WriteLine(PrimaryScreen.DpiX);
                uie.system.Radio = PrimaryScreen.DpiX / 96f;
                CursorPoint cursorPos = new CursorPoint();
                GetPhysicalCursorPos(ref cursorPos);
                uie.system.PointInScreen = new System.Drawing.Point(cursorPos.X, cursorPos.Y);
                uie.system.PointRelative_X = (float)Math.Round(1f * cursorPos.X / uie.system.DesktopSize.Width, 2);
                uie.system.PointRelative_Y = (float)Math.Round(1f * cursorPos.Y / uie.system.DesktopSize.Height, 2);

                int x = 0;
                int y = 0;
                int width = 0;
                int height = 0;
                string imgBase64 = "";
                Bitmap bmp = null;

                switch (ElementType)
                {
                    case "Native":
                        uie.wnd.control_type = selectedElement.Current.ControlType.Id;
                        uie.wnd.name = selectedElement.Current.Name;
                        uie.wnd.class_name = selectedElement.Current.ClassName;
                        string control_type_name = selectedElement.Current.ControlType.ProgrammaticName;
                        uie.wnd.control_type_name = control_type_name.Split('.')[1] + "Control";
                        uie.wnd.rect = selectedElement.Current.BoundingRectangle;
                        Process p = Process.GetProcessById(selectedElement.Current.ProcessId);

                        if (p.MainWindowHandle != IntPtr.Zero)
                        {
                            AutomationElement main = AutomationElement.FromHandle(p.MainWindowHandle);
                            uie.wnd.main_window_property = new IWnd();
                            uie.wnd.main_window_property.control_type = main.Current.ControlType.Id;
                            uie.wnd.main_window_property.name = main.Current.Name;
                            uie.wnd.main_window_property.class_name = main.Current.ClassName;
                            control_type_name = main.Current.ControlType.ProgrammaticName;
                            uie.wnd.main_window_property.control_type_name = control_type_name.Split('.')[1] + "Control";
                            uie.wnd.main_window_property.rect = main.Current.BoundingRectangle;

                            uie.wnd.relative_x = (float)Math.Round(1f * (selectedElement.Current.BoundingRectangle.Left - main.Current.BoundingRectangle.Left) / main.Current.BoundingRectangle.Width, 2);
                            uie.wnd.relative_y = (float)Math.Round(1f * (selectedElement.Current.BoundingRectangle.Top - main.Current.BoundingRectangle.Top) / main.Current.BoundingRectangle.Height, 2);
                        }
                        break;
                    case "IE":
                        selectedHtml.xpath = UIElement.GenerateXPath(selectedHtml.element, false);
                        selectedHtml.full_xpath = UIElement.GenerateXPath(selectedHtml.element, true);
                        uie.html = selectedHtml;
                        uie.html.browser = "Internet Explorer";
                        break;
                    case "Chrome":
                        uie.html = selectedHtml;
                        uie.html.browser = "Chrome";
                        break;
                }

                bmp = SaveImage(this.Location.X, this.Location.Y, this.Size.Width, this.Size.Height);
                imgBase64 = ImageUtil.GetBase64FromImage(bmp);
                uie.element_screenshot = imgBase64;

                //Console.WriteLine(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                //Console.WriteLine("选择结果：");
                //Console.WriteLine(JsonConvert.SerializeObject(uie.html));
                string resultPath = "";
                string CurrentDir = System.IO.Directory.GetCurrentDirectory();
                if (System.IO.Directory.Exists(CurrentDir + "\\public") == false)
                {
                    resultPath = "result.json";
                }
                else
                {
                    resultPath = CurrentDir + "\\public\\base_integration\\uiauto_uiselector\\result.json";
                }

                System.IO.File.WriteAllText(resultPath, JsonConvert.SerializeObject(uie, jsonSetting));
                Console.WriteLine("<uiauto-uiselector>success</uiauto-uiselector>");

                if (this.informationForm.IsHandleCreated)
                {
                    this.informationForm.Visible = false;
                }
                if (IsHandleCreated)
                {
                    this.selectThread.Abort();
                    this.Close();
                    this.Dispose();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
            }
            
        }

        private void Cover_KeyPress(object sender, KeyPressEventArgs e)
        {
            if (e.KeyChar == (char)System.Windows.Forms.Keys.Escape)
            {
                if (IsHandleCreated)
                {
                    this.selectThread.Abort();
                    this.informationForm.Close();
                    this.Close();
                }
            }
        }

        private void Cover_FormClosed(object sender, FormClosedEventArgs e)
        {
            if (mh != null)
            {
                //mh.UnHook();
            }
        }

        private void Cover_Paint(object sender, PaintEventArgs e)
        {
            Color color = Color.Red; //Color.FromArgb(200, 128, 128);
            Rectangle rect = new Rectangle(0, 0, this.Width, this.Height);
            //ControlPaint.DrawBorder(e.Graphics, myRectangle, Color.Blue, ButtonBorderStyle.Solid);//画个边框 
            ControlPaint.DrawBorder(e.Graphics, rect,
                color, 5, ButtonBorderStyle.Solid,
                color, 5, ButtonBorderStyle.Solid,
                color, 5, ButtonBorderStyle.Solid,
                color, 5, ButtonBorderStyle.Solid
            );
        }
    }
}
