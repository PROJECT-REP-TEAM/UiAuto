using SHDocVw;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Net.WebSockets;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WebSocketSharp;
using WebSocketSharp.Server;

namespace UiSelector.entity
{

    public class Chat : WebSocketBehavior
    {

        [Serializable]
        [ComVisible(true)]
        public delegate void RS_DATA_CALLBACK();

        private RS_DATA_CALLBACK MessageCallback;

        protected override void OnMessage(MessageEventArgs e)
        {
            var msg = e.Data == "BALUS"
                      ? "I've been balused already..."
                      : "I'm not available now.";

            Send(msg);
        }

        public void RegisterMessageCallback(RS_DATA_CALLBACK callback)
        {

        }


    }

    class ChromeSocket
    {
      
        public void OpenServer()
        {
            var wssv = new WebSocketServer("ws://localhost:63360");
            wssv.AddWebSocketService<Chat>("/chat", () => new Chat());
            wssv.Start();
        }

        
    }
}
