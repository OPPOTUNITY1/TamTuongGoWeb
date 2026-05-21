using System;
using System.Collections.Generic;
using System.Text;

namespace TamTuong.Service.PromotionUsageService.Request
{
    public class PromotionUsageRequest
    {
        public Guid? Id { get; set; }
        public Guid? PromotionId { get; set; }
        public Guid? OrderId { get; set; }
        public Guid? UserId { get; set; }
        public DateTime? UsedAt { get; set; }
        public float? DiscountAmount { get; set; } 
    }
}
