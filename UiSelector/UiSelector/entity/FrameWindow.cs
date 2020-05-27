using mshtml;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;

namespace UiSelector.entity
{
    class FrameWindow
    {
        public IHTMLRect BoundingRect;
        public IHTMLWindow2 Window;
        public HTMLDocument Document;
        public ArrayList Children;

        public static ArrayList DealIframeWindowTree(HTMLDocument doc)
        {
            ArrayList windows = new ArrayList();
            try
            {
                FramesCollection frames = doc.frames;
                if (frames.length > 0)
                {

                    for (int i = 0; i < frames.length; ++i)
                    {
                        IHTMLWindow2 win = frames.item(i);
                        HTMLDocument winDoc = win.document as HTMLDocument;
                        FrameWindow frameWin = new FrameWindow();
                        frameWin.Window = win;
                        frameWin.Document = win.document as HTMLDocument;
                        IHTMLElement2 docEl = winDoc.documentElement as IHTMLElement2;
                        frameWin.BoundingRect = docEl.getBoundingClientRect();
                        frameWin.Children = FrameWindow.DealIframeWindowTree(winDoc);

                        windows.Add(frameWin);
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
            }

            return windows;
        }
    }
}
