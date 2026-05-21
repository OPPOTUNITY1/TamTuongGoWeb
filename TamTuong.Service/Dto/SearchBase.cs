using System;
using System.Collections.Generic;
using System.Text;

namespace TamTuong.Service.Dto
{
    public class SearchBase
    {
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
