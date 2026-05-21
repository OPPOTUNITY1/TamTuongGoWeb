using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Service.Common;
using TamTuong.Service.Common.Service;
using TamTuong.Service.OrderPromotionService.Dto;
using TamTuong.Service.OrderPromotionService.Request;

namespace TamTuong.Service.OrderPromotionService
{
    public interface IOrderPromotionService : IService<OrderPromotion>
    {
        public Task<PagedList<OrderPromotionDto>> Getdata(OrderPromotionSearch search);
        public Task<OrderPromotionDto> GetDto(Guid id);
    }
}
