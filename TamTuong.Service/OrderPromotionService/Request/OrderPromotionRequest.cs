using System;
using System.Collections.Generic;
using System.Text;

namespace TamTuong.Service.OrderPromotionService.Request
{
    public class OrderPromotionRequest
    {
        public Guid? Id { get; set; }
        public Guid? OrderId { get; set; }
        public Guid? PromotionId { get; set; }
        public Guid? ShopId { get; set; }
        public float? DiscountAmount { get; set; }
    }
}
