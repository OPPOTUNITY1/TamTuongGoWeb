using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Text;

namespace TamTuong.Service.Common
{
    public class ExcelToHtmlHelper
    {
        public static string ConvertExcelToHtml(string excelFilePath)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            using (var package = new ExcelPackage(new FileInfo(excelFilePath)))
            {
                var worksheet = package.Workbook.Worksheets[0];
                if (worksheet is null)
                {
                    return "File Excel không đúng định dạng.";
                }

                var html = "<table style='table-layout: auto;width: 100%;border-collapse: collapse;'>";
                for (int row = 1; row <= worksheet.Dimension.End.Row; row++)
                {
                    html += "<tr>";
                    for (int col = 1; col <= worksheet.Dimension.End.Column; col++)
                    {
                        var cellValue = worksheet.Cells[row, col].Text ?? string.Empty;
                        var formattedValue = cellValue.Replace("\n", "<br>");
                        if (row == 1)
                        {
                            html += $"<th>{formattedValue}</th>";
                        }
                        else
                        {
                            html += $"<td>{formattedValue}</td>";
                        }
                    }
                    html += "</tr>";
                }
                html += "</table>";
                return html;
            }
        }
    }
}

