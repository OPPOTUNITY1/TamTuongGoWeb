using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;

namespace TamTuong.Service.ProductService.Request
{
    public class ProductRequestDto
    {
        public Guid? Id { get; set; }
        public Guid ShopId { get; set; }
        public Guid CategoryId { get; set; }
        public string? ProductName { get; set; }
        public float? RetailPrice { get; set; }
        public float? ImportPrice { get; set; }
        public string? ImageUrl { get; set; }
        public int? Quantity { get; set; }
        public string? Detail { get; set; }
        public string? ThumbnailUrl { get; set; }
        public int? SoldCount { get; set; }
        public List<ProductImage>? ProductImages { get; set; }
    }
}
