using IronBarCode;
using System;
using System.Collections.Generic;
using System.Text;

namespace TamTuong.Service.Core.BarCode
{
    public class BarCodeProvider
    {

        public static string Generate(string? text)
        {
            var myBarcode = BarcodeWriter.CreateBarcode(text, BarcodeWriterEncoding.EAN8);
            myBarcode.ResizeTo(400, 150);
            var guid = Guid.NewGuid().ToString();
            guid = text ?? "";
            myBarcode.SaveAsImage("BarCode/" + guid + ".png");
            return guid;

        }

    }
}
