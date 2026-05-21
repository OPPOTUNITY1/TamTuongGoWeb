using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Service.Common;
using TamTuong.Service.Common.Service;
using TamTuong.Service.PromotionService.Dto;
using TamTuong.Service.PromotionService.Request;

namespace TamTuong.Service.PromotionService
{
    public interface IPromotionService : IService<Promotion>
    {
        public Task<PagedList<PromotionDto>> GetData(PromotionSearch search);
        public Task<PromotionDto> GetDto(Guid id);
    }
}
