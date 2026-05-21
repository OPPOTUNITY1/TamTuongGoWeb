using QRCoder;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Text;

namespace TamTuong.Service.Common
{
    public static class GennericQRCodeHelper
    {
        public static byte[] GenerateQRCode(Guid IdHoSo, string domain, byte[] logoBytes)
        {
            string text = $"{domain}/downloadCO/{IdHoSo}";

            QRCodeGenerator qrGenerator = new QRCodeGenerator();
            QRCodeData qrCodeData = qrGenerator.CreateQrCode(text, QRCodeGenerator.ECCLevel.Q);
            QRCode qrCode = new QRCode(qrCodeData);

            using var qrBitmap = qrCode.GetGraphic(
               pixelsPerModule: 20,
               darkColor: System.Drawing.Color.Black,
               lightColor: System.Drawing.Color.White,
               drawQuietZones: false // 🔥 bỏ viền trắng
           );
            using (var ms = new MemoryStream())
            {
                Bitmap finalImage = new Bitmap(qrBitmap.Width, qrBitmap.Height);
                using (Graphics g = Graphics.FromImage(finalImage))
                {
                    g.DrawImage(qrBitmap, 0, 0, qrBitmap.Width, qrBitmap.Height);

                    if (logoBytes != null && logoBytes.Length > 0)
                    {
                        using (var logoStream = new MemoryStream(logoBytes))
                        using (var logo = new Bitmap(logoStream))
                        {
                            // ---- Tạo logo hình tròn ----
                            int logoSize = qrBitmap.Width / 5; // ~20% QR
                            Bitmap circleLogo = new Bitmap(logoSize, logoSize);

                            using (Graphics gCircle = Graphics.FromImage(circleLogo))
                            {
                                gCircle.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;

                                using (GraphicsPath path = new GraphicsPath())
                                {
                                    path.AddEllipse(0, 0, logoSize, logoSize);
                                    gCircle.SetClip(path);
                                    gCircle.DrawImage(logo, 0, 0, logoSize, logoSize);
                                }
                            }

                            // ---- Vẽ vào giữa QR ----
                            int posX = (qrBitmap.Width - logoSize) / 2;
                            int posY = (qrBitmap.Height - logoSize) / 2;

                            g.DrawImage(circleLogo, posX, posY, logoSize, logoSize);
                        }
                    }
                }

                // Save
                finalImage.Save(ms, System.Drawing.Imaging.ImageFormat.Png);
                return ms.ToArray();
            }
        }
        public static byte[] GenerateQRCode(Guid IdHoSo, string domain)
        {
            //http://localhost:5002://api/HoSo_MauCO/GetFile?id=00000000-0000-0000-0000-000000000000

            string text = $"{domain}/api/HoSo_MauCO/GetFile?id={IdHoSo}";
            QRCodeGenerator qrGenerator = new QRCodeGenerator();
            QRCodeData qrCodeData = qrGenerator.CreateQrCode(text, QRCodeGenerator.ECCLevel.Q);
            QRCode qrCode = new QRCode(qrCodeData);

            using (System.Drawing.Bitmap qrBitmap = qrCode.GetGraphic(20))
            using (var ms = new MemoryStream())
            {
                qrBitmap.Save(ms, System.Drawing.Imaging.ImageFormat.Png);
                return ms.ToArray();
            }
        }
    }
}
