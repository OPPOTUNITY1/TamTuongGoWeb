using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Service.Dto;

namespace TamTuong.Service.ProductImageService.Request
{
    public class ProductImageSearch : SearchBase
    {
        public Guid? ProductId { get; set; }
    }
}
