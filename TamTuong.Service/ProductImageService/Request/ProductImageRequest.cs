using System;
using System.Collections.Generic;
using System.Text;

namespace TamTuong.Service.ProductImageService.Request
{
    public class ProductImageRequest
    {
        public Guid? Id { get; set; }
        public string? ImageUrl { get; set; }
        public Guid ProductId { get; set; }
    }
}
