using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Service.Dto;

namespace TamTuong.Service.PromotionService.Request
{
    public class PromotionSearch : SearchBase
    {
        public Guid? ShopId { get; set; }
    }
}
