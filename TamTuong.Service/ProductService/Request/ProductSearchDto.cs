using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Service.Dto;

namespace TamTuong.Service.ProductService.Request
{
    public class ProductSearchDto : SearchBase
    {
        public Guid? Id { get; set; }
        public Guid? ShopId { get; set; }
        public string? ProductName { get; set; }
        public float? RetailPrice { get; set; }
    }
}
