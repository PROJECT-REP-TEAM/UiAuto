using SHDocVw;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Automation;

namespace UiSelector.entity
{
    class IEBrowser
    {
        public InternetExplorer Browser;
        public AutomationElement Element;
        public int Processid;
        public int ContentProcessid;
        public ArrayList FrameWindows;
        public float Radio;
        public bool IsHidden;
    }
}
