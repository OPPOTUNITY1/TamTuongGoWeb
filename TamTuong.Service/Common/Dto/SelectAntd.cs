using System;
using System.Collections.Generic;
using System.Text;

namespace TamTuong.Service.Common.Dto
{
    public class SelectAntd
    {
        public object Value { get; set; }
        public bool Disabled { get; set; } = false;
        public bool Selected { get; set; } = false;

        public string Label { get; set; }


    }
}

