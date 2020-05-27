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

namespace UiSelector
{
    public partial class Information : Form
    {
        public Information()
        {
            SetProcessDPIAware();
            InitializeComponent();
            Control.CheckForIllegalCrossThreadCalls = false;
            this.StartPosition = FormStartPosition.Manual;
            this.Location = new System.Drawing.Point(0, 0);

            //this.mouseThreadTimer = new System.Threading.Timer(new TimerCallback(RealMousePosition), null, Timeout.Infinite, 1000);
            //调用Start方法执行线程
            //this.mouseThreadTimer.Change(0, 100);
        }
        [DllImport("user32.dll")]
        public static extern bool ReleaseCapture();
        [DllImport("user32.dll")]
        public static extern bool SendMessage(IntPtr hwnd, int wMsg, int wParam, int lParam);

        System.Threading.Timer mouseThreadTimer = null;

        [DllImport("user32.dll", EntryPoint = "GetWindowLong")]
        public static extern long GetWindowLong(IntPtr hwnd, int nIndex);
        [DllImport("user32.dll", EntryPoint = "SetWindowLong")]
        public static extern long SetWindowLong(IntPtr hwnd, int nIndex, long dwNewLong);
        [DllImport("user32.dll", EntryPoint = "SetLayeredWindowAttributes")]
        public static extern int SetLayeredWindowAttributes(IntPtr Handle, int crKey, byte bAlpha, int dwFlags);


        [System.Runtime.InteropServices.DllImport("user32.dll")]
        internal static extern bool SetProcessDPIAware();


        //调用API
        [DllImport("user32.dll", CharSet = System.Runtime.InteropServices.CharSet.Auto, ExactSpelling = true)]
        public static extern IntPtr GetForegroundWindow(); //获得本窗体的句柄
        [DllImport("user32.dll", EntryPoint = "SetForegroundWindow")]
        public static extern bool SetForegroundWindow(IntPtr hWnd);//设置此窗体为活动窗体


        [DllImport("kernel32.dll", SetLastError = true)]
            [return: System.Runtime.InteropServices.MarshalAs(System.Runtime.InteropServices.UnmanagedType.Bool)]
        static extern bool AllocConsole();

        [System.Runtime.InteropServices.DllImport("Kernel32")]
        public static extern void FreeConsole();

        const int GWL_EXSTYLE = -20;
        const int WS_EX_TRANSPARENT = 0x20;
        const int WS_EX_LAYERED = 0x80000;
        const int LWA_ALPHA = 2;

        MouseHook mh;
        public Thread selectThread = null;

        //创建图象，保存将来截取的图象
        Bitmap bmpImage = null;
        Graphics imgGraphics = null;
        Cover selectCover = null;

        private void mh_MouseClickEvent(object sender, MouseEventArgs e)
        {
            MessageBox.Show(e.X + "-" + e.Y);
        }

        private void mh_MouseMoveEvent(object sender, MouseEventArgs e)
        {
            int x = e.Location.X;
            int y = e.Location.Y;
            System.Drawing.Point screenPoint = Control.MousePosition;
            //this.label_mousePosition.Text = "x: " + screenPoint.X + ", y: " + screenPoint.Y;

            //SetForegroundWindow(this.Handle);

        }

        private void Information_Load(object sender, EventArgs e)
        {
            //this.BackColor = Color.Silver;
            this.TopMost = true;
            this.FormBorderStyle = FormBorderStyle.None;
            //this.WindowState = FormWindowState.Maximized;
            //SetWindowLong(Handle, GWL_EXSTYLE, GetWindowLong(Handle, GWL_EXSTYLE) | WS_EX_TRANSPARENT | WS_EX_LAYERED);
            //SetLayeredWindowAttributes(Handle, 0, 128, LWA_ALPHA);

            //selectCover = new Cover();

            bmpImage = new Bitmap(Screen.PrimaryScreen.Bounds.Width, Screen.PrimaryScreen.Bounds.Height);
            imgGraphics = Graphics.FromImage(bmpImage);

            //new Thread(new ThreadStart(this.RunSelectedCover)).Start();

            selectThread = new Thread(new ThreadStart(this.RealMousePosition));
            selectThread.IsBackground = true;
            selectThread.Start();

            //mh = new MouseHook();
            //mh.SetHook();
            //mh.MouseMoveEvent += mh_MouseMoveEvent;
            //mh.MouseClickEvent += mh_MouseClickEvent;

        }

        private void Information_MouseDown(object sender, MouseEventArgs e)
        {
            
        }

        private void Information_MouseMove(object sender, MouseEventArgs e)
        {

        }

        private void Information_MouseUp(object sender, MouseEventArgs e)
        {

        }

        private void Information_MouseEnter(object sender, EventArgs e)
        {
            this.ChangeInformationPostion();
        }

        private void Information_KeyPress(object sender, KeyPressEventArgs e)
        {
            /*if (e.KeyChar == (char)Keys.Escape)
            {
                if (IsHandleCreated)
                {
                    this.Close();
                }
            }*/
        }

        private void selectedArea_MouseEnter(object sender, EventArgs e)
        {
            this.ChangeInformationPostion();
        }

        private void ChangeInformationPostion()
        {
            //鼠标移到信息框时变换信息框的位置
            //这个区域包括任务栏，就是屏幕显示的物理范围
            Rectangle ScreenArea = System.Windows.Forms.Screen.GetBounds(this);
            int ScreenWidth = ScreenArea.Width; //屏幕宽度 int height1 = ScreenArea.Height; //屏幕高度
            int ScreenHeight = ScreenArea.Height; //屏幕宽度 int height1 = ScreenArea.Height; //屏幕高度
            int x = ScreenWidth - this.Width;
            int y = ScreenHeight - this.Height;
            this.Location = (this.Location.X == 0 && this.Location.Y == 0) ? new System.Drawing.Point(x, y) : new System.Drawing.Point(0, 0);
            //SetForegroundWindow(this.Handle);
        }

        private void RealMousePosition()
        {
            System.Drawing.Point prePoint = Control.MousePosition;
            try
            {
                bool selectLock = false;
                while (true)
                {
                    System.Drawing.Point screenPoint = Control.MousePosition;
                    this.label_mousePosition.Text = "x: " + screenPoint.X + ", y: " + screenPoint.Y;
                    //创建图象，保存将来截取的图象
                    Bitmap image = new Bitmap(75, 75);
                    Graphics imgGraphics = Graphics.FromImage(image);
                    //设置截屏区域
                    imgGraphics.CopyFromScreen(screenPoint.X - 75 / 2, screenPoint.Y - 75 / 2, 0, 0, new System.Drawing.Size(75, 75));
                    IntPtr dc1 = imgGraphics.GetHdc();
                    imgGraphics.ReleaseHdc(dc1);
                    this.selectedArea.Image = image;

                    /*if (prePoint.X == screenPoint.X && prePoint.Y == screenPoint.Y)
                    {
                        if (!selectLock)
                        {
                            //selectCover.Visible = false;
                            selectLock = true;
                            System.Windows.Point point = new System.Windows.Point(screenPoint.X, screenPoint.Y);
                            AutomationElement parentElement = AutomationElement.FromPoint(point);
                            AutomationElement.AutomationElementInformation currentControl = parentElement.Current;
                            Console.WriteLine(JsonConvert.SerializeObject(parentElement.Current));
                            selectCover.Location = new System.Drawing.Point((int)currentControl.BoundingRectangle.Left, (int)currentControl.BoundingRectangle.Top);
                            selectCover.Size = new System.Drawing.Size((int)currentControl.BoundingRectangle.Width, (int)currentControl.BoundingRectangle.Height);
                            selectCover.Cursor = Cursors.Hand;
                            selectCover.UseWaitCursor = false;
                            selectCover.Visible = true;
                        }
                    } 
                    else
                    {
                        
                        

                        selectLock = false;
                        prePoint = screenPoint;
                        selectCover.Visible = false;
                    }*/
                    

                    Thread.Sleep(100);
                }
                
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
            }
            

        }

        private void RunSelectedCover()
        {
            selectCover.Visible = false;
        }

        private void Information_FormClosed(object sender, FormClosedEventArgs e)
        {
            if (mh != null)
            {
                //mh.UnHook();
            }
            
        }

        public void UpdateLabelMousePosition(String text)
        {
            this.label_mousePosition.Text = text;
        }

        public void SaveImage(string path)
        {
            
        }

        public void SetElementTag(string tag)
        {
            this.label_element.Text = tag;
        }
    }
}
