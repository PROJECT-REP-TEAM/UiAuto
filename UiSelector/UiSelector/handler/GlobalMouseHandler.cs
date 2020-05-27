using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows.Forms;

namespace UiSelector
{
    class GlobalMouseHandler : IMessageFilter
    {
        private readonly int WM_MOUSEMOVE = 0x0200;
        Form winForm = null;

        public GlobalMouseHandler(Form form)
        {
            this.winForm = form;
        }

        public bool PreFilterMessage(ref Message m)
        {
            if (m.Msg == WM_MOUSEMOVE)
            {
                this.winForm.Visible = false;
            }
            return true;
        }
    }
}
