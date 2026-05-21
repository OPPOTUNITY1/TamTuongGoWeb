using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Service.Dto;

namespace TamTuong.Service.ShopService.Request
{
    public class ShopSearchDto : SearchBase
    {
        public Guid? Id { get; set; }
        public Guid? SellerId { get; set; }
        public string? Name { get; set; }
    }
}
