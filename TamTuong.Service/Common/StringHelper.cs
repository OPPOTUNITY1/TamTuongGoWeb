using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;

namespace TamTuong.Service.Common
{
    public static class StringHelper
    {
        public static string ConvertToUnsign(string str)
        {
            string[] signs = new string[] {
                "aAeEoOuUiIdDyY ",
                "áàạảãâấầậẩẫăắằặẳẵ",
                "ÁÀẠẢÃÂẤẦẬẨẪĂẮẰẶẲẴ",
                "éèẹẻẽêếềệểễ",
                "ÉÈẸẺẼÊẾỀỆỂỄ",
                "óòọỏõôốồộổỗơớờợởỡ",
                "ÓÒỌỎÕÔỐỒỘỔỖƠỚỜỢỞỠ",
                "úùụủũưứừựửữ",
                "ÚÙỤỦŨƯỨỪỰỬỮ",
                "íìịỉĩ",
                "ÍÌỊỈĨ",
                "đ",
                "Đ",
                "ýỳỵỷỹ",
                "ÝỲỴỶỸ",
                "!@#$%^&*(),.[]{}"
            };

            for (int i = 1; i < signs.Length; i++)
            {
                for (int j = 0; j < signs[i].Length; j++)
                {
                    str = str.Replace(signs[i][j], signs[0][i - 1]);
                }
            }
            for (int i = 0; i < signs[signs.Length - 1].Length; i++)
            {
                str = str.Replace(signs[signs.Length - 1][i], ' ');
            }

            str = str.Replace("\t", "");
            return str;
        }
        public static string RemoveVietnameseAccents(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return "";

            string normalized = input.Normalize(NormalizationForm.FormD);
            var sb = new StringBuilder();

            foreach (var c in normalized)
            {
                var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                    sb.Append(c);
            }

            string result = sb.ToString().Normalize(NormalizationForm.FormC);

            return result.Replace("Đ", "D").Replace("đ", "d").ToUpper();
        }
        public static string RemoveVietnameseAccentsNoUpper(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return "";

            string normalized = input.Normalize(NormalizationForm.FormD);
            var sb = new StringBuilder();

            foreach (var c in normalized)
            {
                var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                    sb.Append(c);
            }

            string result = sb.ToString().Normalize(NormalizationForm.FormC);

            return result.Replace("Đ", "D").Replace("đ", "d");
        }

        public static string ToVnd(double number)
        {
            return string.Format(new CultureInfo("vi-VN"), "{0:N0} đ", number);
        }

        // 2. Chuyển số thành chữ
        public static string NumberToVietnamese(double number)
        {
            if (number == 0) return "Không đồng";

            string[] unitNumbers = { "", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín" };
            string[] placeValues = { "", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ" };

            string result = "";
            int place = 0;

            while (number > 0)
            {
                int threeDigits = (int)(number % 1000);
                if (threeDigits != 0)
                {
                    result = ReadThreeDigits(threeDigits, unitNumbers) + " " + placeValues[place] + " " + result;
                }

                number /= 1000;
                place++;
            }

            result = result.Trim();
            result = char.ToUpper(result[0]) + result.Substring(1);

            return result + " đồng";
        }

        private static string ReadThreeDigits(int number, string[] unitNumbers)
        {
            int hundred = number / 100;
            int ten = (number % 100) / 10;
            int unit = number % 10;

            string result = "";

            if (hundred > 0)
                result += unitNumbers[hundred] + " trăm ";

            if (ten > 1)
            {
                result += unitNumbers[ten] + " mươi ";
                if (unit == 1) result += "mốt ";
                else if (unit == 5) result += "lăm ";
                else if (unit > 0) result += unitNumbers[unit] + " ";
            }
            else if (ten == 1)
            {
                result += "mười ";
                if (unit == 5) result += "lăm ";
                else if (unit > 0) result += unitNumbers[unit] + " ";
            }
            else if (unit > 0)
            {
                if (hundred > 0) result += "lẻ ";
                result += unitNumbers[unit] + " ";
            }

            return result;
        }
        public static string HtmlToText(string html)
        {
            if (string.IsNullOrEmpty(html)) return "";

            // decode html entity
            html = WebUtility.HtmlDecode(html);

            // xuống dòng cho block
            html = Regex.Replace(html, @"</p>|</div>", "\n", RegexOptions.IgnoreCase);
            html = Regex.Replace(html, @"<br\s*/?>", "\n", RegexOptions.IgnoreCase);

            // list item -> bullet
            html = Regex.Replace(html, @"<li[^>]*>", "\n- ", RegexOptions.IgnoreCase);

            // remove tag ul/ol
            html = Regex.Replace(html, @"</?ul[^>]*>|</?ol[^>]*>", "", RegexOptions.IgnoreCase);

            // remove span/strong/other tags
            html = Regex.Replace(html, @"<.*?>", "");

            // clean nhiều newline
            html = Regex.Replace(html, @"\n{2,}", "\n");

            return html.Trim();
        }
    }
}
