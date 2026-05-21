using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Service.Constant;
using TamTuong.Service.Dto;

namespace TamTuong.Service.Core
{
    public static class KieuDuLieuHelper
    {
        // 🔹 Map DisplayName
        private static readonly Dictionary<int, string> _displayNames = new()
    {
        { KieuDuLieuConstant.TextBox, "Text Box" },
        { KieuDuLieuConstant.CheckBox, "Check Box" },
        { KieuDuLieuConstant.Dropdown, "Dropdown" },
        { KieuDuLieuConstant.TextArea, "Text Area" },
        { KieuDuLieuConstant.ListBox_Multiple, "List Box (Multiple)" },
        { KieuDuLieuConstant.Number, "Number" },
        { KieuDuLieuConstant.Date, "Date" },
        { KieuDuLieuConstant.Email, "Email" },
    };
        public static string GetDisplayName(int type)
        {
            return _displayNames.TryGetValue(type, out var name)
                ? name
                : string.Empty;
        }


        public static List<DropdownOption> GetAllForDropdown()
        {
            return _displayNames
                .Select(x => new DropdownOption
                {
                    Label = x.Value,
                    Value = x.Key.ToString(),
                })
                .ToList();
        }
    }
}
