using System;
using System.Collections.Generic;
using System.Text;

namespace TamTuong.Service.OrderService.Request
{
    public class OrderRequest
    {
        public Guid? Id { get; set; }
        public Guid? UserId { get; set; }
        public Guid? UserInformationId { get; set; }
        public DateTime? OrderDate { get; set; }
        public float? TotalAmount { get; set; }
        public string? Status { get; set; }
        public float? DiscountAmount { get; set; }
    }
}
