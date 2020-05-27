using System.Drawing;
using System.Windows.Forms;

namespace UiSelector
{
    partial class Information
    {
        /// <summary>
        /// 必需的设计器变量。
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// 清理所有正在使用的资源。
        /// </summary>
        /// <param name="disposing">如果应释放托管资源，为 true；否则为 false。</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows 窗体设计器生成的代码

        /// <summary>
        /// 设计器支持所需的方法 - 不要修改
        /// 使用代码编辑器修改此方法的内容。
        /// </summary>
        private void InitializeComponent()
        {
            this.selectedArea = new System.Windows.Forms.PictureBox();
            this.label_mousePosition = new System.Windows.Forms.Label();
            this.label3 = new System.Windows.Forms.Label();
            this.label4 = new System.Windows.Forms.Label();
            this.label5 = new System.Windows.Forms.Label();
            this.label_element = new System.Windows.Forms.Label();
            this.label1 = new System.Windows.Forms.Label();
            ((System.ComponentModel.ISupportInitialize)(this.selectedArea)).BeginInit();
            this.SuspendLayout();
            // 
            // selectedArea
            // 
            this.selectedArea.Anchor = System.Windows.Forms.AnchorStyles.None;
            this.selectedArea.Location = new System.Drawing.Point(0, 0);
            this.selectedArea.Margin = new System.Windows.Forms.Padding(0);
            this.selectedArea.Name = "selectedArea";
            this.selectedArea.Size = new System.Drawing.Size(167, 167);
            this.selectedArea.SizeMode = System.Windows.Forms.PictureBoxSizeMode.StretchImage;
            this.selectedArea.TabIndex = 0;
            this.selectedArea.TabStop = false;
            this.selectedArea.MouseEnter += new System.EventHandler(this.selectedArea_MouseEnter);
            // 
            // label_mousePosition
            // 
            this.label_mousePosition.Location = new System.Drawing.Point(0, 200);
            this.label_mousePosition.Name = "label_mousePosition";
            this.label_mousePosition.RightToLeft = System.Windows.Forms.RightToLeft.No;
            this.label_mousePosition.Size = new System.Drawing.Size(167, 13);
            this.label_mousePosition.TabIndex = 2;
            this.label_mousePosition.Text = "x: 0 y:0";
            this.label_mousePosition.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // label3
            // 
            this.label3.BorderStyle = System.Windows.Forms.BorderStyle.Fixed3D;
            this.label3.Location = new System.Drawing.Point(0, 220);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(167, 1);
            this.label3.TabIndex = 3;
            // 
            // label4
            // 
            this.label4.Location = new System.Drawing.Point(0, 228);
            this.label4.Name = "label4";
            this.label4.Padding = new System.Windows.Forms.Padding(8, 0, 0, 0);
            this.label4.Size = new System.Drawing.Size(167, 17);
            this.label4.TabIndex = 4;
            this.label4.Text = "[ESC]-取消选择";
            this.label4.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // label5
            // 
            this.label5.Location = new System.Drawing.Point(0, 251);
            this.label5.Name = "label5";
            this.label5.Padding = new System.Windows.Forms.Padding(8, 0, 0, 0);
            this.label5.RightToLeft = System.Windows.Forms.RightToLeft.No;
            this.label5.Size = new System.Drawing.Size(167, 17);
            this.label5.TabIndex = 5;
            this.label5.Text = "[鼠标左键]-确认选择";
            this.label5.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // label_element
            // 
            this.label_element.Location = new System.Drawing.Point(0, 173);
            this.label_element.Margin = new System.Windows.Forms.Padding(2, 0, 2, 0);
            this.label_element.Name = "label_element";
            this.label_element.Size = new System.Drawing.Size(167, 13);
            this.label_element.TabIndex = 6;
            this.label_element.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // label1
            // 
            this.label1.Location = new System.Drawing.Point(0, 287);
            this.label1.Margin = new System.Windows.Forms.Padding(2, 0, 2, 0);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(167, 27);
            this.label1.TabIndex = 7;
            this.label1.Text = "Chrome浏览器需要额外添加扩展程序";
            // 
            // Information
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 12F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.BackColor = System.Drawing.Color.White;
            this.ClientSize = new System.Drawing.Size(167, 320);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.label_element);
            this.Controls.Add(this.label5);
            this.Controls.Add(this.label4);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.label_mousePosition);
            this.Controls.Add(this.selectedArea);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.None;
            this.Name = "Information";
            this.ShowIcon = false;
            this.ShowInTaskbar = false;
            this.Text = "实时信息";
            this.TopMost = true;
            this.FormClosed += new System.Windows.Forms.FormClosedEventHandler(this.Information_FormClosed);
            this.Load += new System.EventHandler(this.Information_Load);
            this.KeyPress += new System.Windows.Forms.KeyPressEventHandler(this.Information_KeyPress);
            this.MouseDown += new System.Windows.Forms.MouseEventHandler(this.Information_MouseDown);
            this.MouseEnter += new System.EventHandler(this.Information_MouseEnter);
            this.MouseMove += new System.Windows.Forms.MouseEventHandler(this.Information_MouseMove);
            this.MouseUp += new System.Windows.Forms.MouseEventHandler(this.Information_MouseUp);
            ((System.ComponentModel.ISupportInitialize)(this.selectedArea)).EndInit();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.PictureBox selectedArea;
        private System.Windows.Forms.Label label_mousePosition;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.Label label4;
        private System.Windows.Forms.Label label5;
        private Label label1;
        private Label label_element;
    }
}

