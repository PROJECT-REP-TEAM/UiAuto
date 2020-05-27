using System;
using System.Security.Policy;
using System.Windows.Converters;
using Newtonsoft.Json;
using OpenQA.Selenium;
using OpenQA.Selenium.Remote;

namespace UiSelector.entity
{
    class ReuseWebDriver : RemoteWebDriver
    {

        private String _sessionId;

        public ReuseWebDriver(Uri url, String sessionId, OpenQA.Selenium.Chrome.ChromeOptions options) : base(url, options)
        {
            this._sessionId = sessionId;
            var sessionIdBase = this.GetType()
                .BaseType
                .GetField("sessionId",
                          System.Reflection.BindingFlags.Instance |
                          System.Reflection.BindingFlags.NonPublic);
            sessionIdBase.SetValue(this, new SessionId(sessionId));
        }
        

        protected override Response Execute(string driverCommandToExecute, System.Collections.Generic.Dictionary<string, object> parameters)
        {
            Response respBase = new Response();
            try
            {
                Console.WriteLine(driverCommandToExecute);
                //OpenQA.Selenium.Remote.Response respBase = base.Execute(driverCommandToExecute, parameters);
                if (driverCommandToExecute == DriverCommand.NewSession)
                {
                    respBase.Status = OpenQA.Selenium.WebDriverResult.Success;
                    respBase.SessionId = this._sessionId;
                    respBase.Value = new System.Collections.Generic.Dictionary<String, Object>();
                }
                else
                {
                    respBase = base.Execute(driverCommandToExecute, parameters);
                    Console.WriteLine(JsonConvert.SerializeObject(respBase));
                }
                
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }


            return respBase;

        }

        
    }
}
