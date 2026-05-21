using System;

namespace TamTuong.Service.ShopService.Request
{
    public class ShopRequestDto
    {
        public Guid? Id { get; set; }
        public Guid SellerId { get; set; }
        public string? Name { get; set; }
    }
}
