using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UiSelector.entity
{
    class ImageUtil
    {
        /// <summary>
        /// 将图片转换成base64字符串。
        /// </summary>
        /// <returns>base64字符串。</returns>
        public static string GetBase64FromImage(Bitmap image)
        {
            string strbaser64 = "";

            try
            {
                using (MemoryStream ms = new MemoryStream())
                {
                    image.Save(ms, System.Drawing.Imaging.ImageFormat.Jpeg);
                    byte[] arr = new byte[ms.Length];
                    ms.Position = 0;
                    ms.Read(arr, 0, (int)ms.Length);
                    ms.Close();

                    strbaser64 = "data:image/png;base64," + Convert.ToBase64String(arr);
                }
            }
            catch (Exception)
            {
                throw new Exception("Something wrong during convert!");
            }

            return strbaser64;
        }
    }
}
