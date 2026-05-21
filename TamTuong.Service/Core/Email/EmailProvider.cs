using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;

namespace TamTuong.Service.Core.Email
{
    public class EmailProvider
    {

        public static string GetMailBody(string fileName)
        {
            return File.ReadAllText(Path.Combine(Directory.GetCurrentDirectory(), $"Core/Email/Templete/{fileName}"));
        }
        public static string BindingDataToMailContent<T>(object dataObj, string content) where T : class
        {
            if (!string.IsNullOrEmpty(content))
            {
                var listkey = Regex.Matches(content, @"\{\{[a-zA-Z0-9_]{3,}\}\}");

                if (listkey != null && listkey.Count > 0)
                {
                    foreach (var item in listkey)
                    {
                        var propertyMath = Regex.Match(item.ToString(), @"^\{\{(?<pkey>[a-zA-Z0-9_]{3,})\}\}$");
                        if (propertyMath.Success)
                        {
                            var propertyName = propertyMath.Groups["pkey"].ToString();

                            if (!string.IsNullOrEmpty(propertyName))
                            {
                                var valueProperty = string.Empty;
                                var data = dataObj as T;
                                var property = typeof(T).GetProperty(propertyName);
                                if (property != null)
                                {
                                    if (property.GetValue(data, null) != null)
                                    {
                                        valueProperty = property.GetValue(data, null).ToString();
                                    }
                                }
                                content = content.Replace(item.ToString(), valueProperty);
                            }
                        }
                        else
                        {
                            content = content.Replace(item.ToString(), string.Empty);
                        }
                    }
                }
            }
            return content;
        }


    }
}