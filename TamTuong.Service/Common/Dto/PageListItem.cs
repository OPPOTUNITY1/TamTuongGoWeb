using System;
using System.Collections.Generic;
using System.Text;

namespace TamTuong.Service.Common.Dto
{
    public class PageListItem
    {
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPage { get; set; }
        public string? Api { get; set; }
        public object? ParamsApi { get; set; }
        public string Method { get; set; }
        public string KeyElement { get; set; }
    }
}
