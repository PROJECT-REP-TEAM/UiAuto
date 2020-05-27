using Newtonsoft.Json;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Remote;
using SHDocVw;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Windows.Forms;
using UiSelector.entity;
using WebSocketSharp.Server;

namespace UiSelector
{

    static class Program
    {

        /// <summary>
        /// 应用程序的主入口点。
        /// </summary>
        [STAThread]
        static void Main()
        {

            Console.WriteLine("真实的屏幕物理分辨率：" + PrimaryScreen.WorkingArea);
            Console.WriteLine("当前系统的X轴DPI：" + PrimaryScreen.DpiX);
            Console.WriteLine("当前系统的Y轴DPI：" + PrimaryScreen.DpiY);
            Console.WriteLine("系统设置的分辨率：" + PrimaryScreen.DESKTOP);
            Console.WriteLine("系统设置的X轴缩放比例：" + PrimaryScreen.ScaleX);
            Console.WriteLine("系统设置的Y轴缩放比例：" + PrimaryScreen.ScaleY);

            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            IWebDriver ChromeDriver = null;
            int exit_code = 0;

            UIAutoSocket.StartSocketServer();

            while (true)
            {

                string input =  Console.ReadLine();

                try
                {
                    switch (input)
                    {
                        case "start":
                            Application.Run(new Cover(ChromeDriver));
                            break;
                        case "open_chrome":
                            if (ChromeDriver == null)
                            {
                                string driverPath = "C:\\UiAuto\\env\\webdriver\\win32";
                                string CurrentDir = System.IO.Directory.GetCurrentDirectory();
                                string resultPath = "";
                                if (System.IO.Directory.Exists(CurrentDir + "\\public") == false)
                                {
                                    resultPath = "result.json";
                                }
                                else
                                {
                                    resultPath = CurrentDir + "\\public\\base_integration\\uiauto_uiselector\\result.json";
                                    driverPath = CurrentDir + "\\env\\webdriver\\win32";
                                }
                                ChromeDriverService driverService = ChromeDriverService.CreateDefaultService(driverPath);
                                ChromeDriver = new ChromeDriver(driverService);
                                RemoteWebDriver driver = (RemoteWebDriver)ChromeDriver;
                                RemoteDriverService remoteDriverService = new RemoteDriverService();
                                remoteDriverService.executor_url = driverService.ServiceUrl.ToString();
                                remoteDriverService.session_id = driver.SessionId.ToString();
                                System.IO.File.WriteAllText(resultPath, JsonConvert.SerializeObject(remoteDriverService));
                                Console.WriteLine(JsonConvert.SerializeObject(remoteDriverService));
                            }
                            else
                            {
                                ChromeDriver.Close();
                                ChromeDriver.Quit();
                            }
                            break;
                        case "close_chrome":
                            if (ChromeDriver != null)
                            {
                                ChromeDriver.Close();
                                ChromeDriver.Quit();
                                ChromeDriver = null;
                            }
                            break;
                        case "exit_app":
                            if (ChromeDriver != null)
                            {
                                ChromeDriver.Close();
                                ChromeDriver.Quit();
                                ChromeDriver = null;
                            }
                            Application.Exit();
                            exit_code = 1;
                            break;
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e.Message);
                }

                if (exit_code == 1)
                {
                    break;
                }
                
            }
        }
    }
}
