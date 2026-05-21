using System;

namespace TamTuong.Service.SellerService.Request
{
    public class SellerRequestDto
    {
        public Guid? Id { get; set; }
        public Guid UserId { get; set; }
        public string? BusinessName { get; set; }
        public string? TaxCode { get; set; }
    }
}
