using mshtml;
using System.Windows.Forms;

namespace UiSelector.entity
{
    class UIElement
    {
        public SystemInfo system;
        public IWnd wnd;
        public IHtml html;

        public string element_screenshot;

        public UIElement()
        {
            system = new SystemInfo();
            wnd = new IWnd();
            html = new IHtml();
        }

        public static int GetLeft(IHTMLElement doc)
        {
            int Left = 0;

            if (doc.offsetParent != null)
            {
                Left += doc.offsetLeft + UIElement.GetLeft(doc.offsetParent);
            }

            return Left;
        }

        public static int GetTop(IHTMLElement doc)
        {
            int Top = 0;

            if (doc.offsetParent != null)
            {
                Top += doc.offsetTop + UIElement.GetTop(doc.offsetParent);
            }

            return Top;
        }

        public static string GenerateXPath(IHTMLElement element, bool isFull)
        {
            string xpath = "";

            if (element.id != null && !isFull)
            {
                return "//*[@id='" + element.id + "']";
            }

            if (element.tagName.ToLower() == "body")
            {
                return "/html/body";
            }

            int ix = 1;
            IHTMLElementCollection siblings = element.parentElement.children;
            int sameTagCount = 0;
            foreach (IHTMLElement sibling in siblings)
            {
                if (sibling.tagName.ToLower() == element.tagName.ToLower())
                {
                    sameTagCount++;
                }
            }
            //System.Console.WriteLine("同级相同标签个数：" + sameTagCount);
            if (sameTagCount == 1)
            {
                xpath += GenerateXPath(element.parentElement, isFull) + "/" + element.tagName.ToLower();
            }
            else
            {
                foreach (IHTMLElement sibling in siblings)
                {
                    if (sibling.sourceIndex == element.sourceIndex)
                    {
                        xpath += GenerateXPath(element.parentElement, isFull) + "/" + element.tagName.ToLower() + "[" + ix + "]";
                    }
                    else
                    {
                        if (sibling.tagName.ToLower() == element.tagName.ToLower())
                        {
                            ix++;
                        }
                    }
                }
            }

            return xpath;
        }
    }
}
