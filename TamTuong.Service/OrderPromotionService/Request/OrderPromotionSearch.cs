using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Service.Dto;

namespace TamTuong.Service.OrderPromotionService.Request
{
    public class OrderPromotionSearch : SearchBase
    {
        public Guid? OrderId { get; set; }
        public Guid? PromotionId { get; set; }
        public Guid? ShopId { get; set; }
    }
}
