using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Service.Dto;

namespace TamTuong.Service.PromotionUsageService.Request
{
    public class PromotionUsageSearch : SearchBase
    {
        public Guid? PromotionId { get; set; }
        public Guid? OrderId { get; set; }
        public Guid? UserId { get; set; }
    }
}
