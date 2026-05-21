using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace TamTuong.Service.Core
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
    }
}
