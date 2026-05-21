using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;

namespace TamTuong.Service.ProductService.Dto
{
    public class ProductDto : Product
    {
        public string? ShopName { get; set; }
        public string? CategoryName { get; set; }
        public List<ProductImage>? ProductImages { get; set; }
    }
}
