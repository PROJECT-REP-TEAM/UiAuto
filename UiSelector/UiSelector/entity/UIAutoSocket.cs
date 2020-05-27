using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using WebSocketSharp;
using WebSocketSharp.Server;

namespace UiSelector.entity
{

    [Serializable]
    [ComVisible(true)]
    public delegate void RS_DATA_CALLBACK(string id, string result);

    class UIAutoSocket
    {

        public static Dictionary<string, object> SocketBehaviorMap = new Dictionary<string, object>();
        public static SocketBehavior CureentSocketBehavior = null;
        private static RS_DATA_CALLBACK MessageCallback = null;

        
        public class SocketBehavior: WebSocketBehavior
        {

            protected override void OnOpen()
            {
                base.OnOpen();
                Console.WriteLine("WebSocket OnOpen");
                SocketBehaviorMap.Add(this.ID, this);
                CureentSocketBehavior = this;
            }

            protected override void OnMessage(MessageEventArgs e)
            {
                //Console.WriteLine("WebSocket OnMessage: " + e.Data + " " + this.ID);

                if (MessageCallback != null)
                {
                    MessageCallback(this.ID, e.Data);
                }
            }

            protected override void OnClose(CloseEventArgs e)
            {
                Console.WriteLine("WebSocket OnClose", e.Reason);
                base.OnClose(e);
                if (SocketBehaviorMap.ContainsKey(this.ID))
                {
                    SocketBehaviorMap.Remove(this.ID);
                }
            }

            protected override void OnError(ErrorEventArgs e)
            {
                Console.WriteLine("WebSocket OnError", e.Message);
                base.OnError(e);
                if (SocketBehaviorMap.ContainsKey(this.ID))
                {
                    SocketBehaviorMap.Remove(this.ID);
                }
            }

            public void SendMessage(string msg)
            {
                this.Send(msg);
            }
        }

        
        public static void StartSocketServer()
        {
            var wssv = new WebSocketServer("ws://127.0.0.1:63360");
            
            wssv.AddWebSocketService<SocketBehavior>("/chrome", (s) => {
                //SocketBehaviorMap.Add(s.ID, s);
            });
            wssv.Start();
        }


        public static void RegisterMessageCallback(RS_DATA_CALLBACK callback)
        {
            MessageCallback = callback;
        }
    }
}
