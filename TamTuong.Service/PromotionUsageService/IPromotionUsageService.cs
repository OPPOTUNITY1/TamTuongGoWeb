using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Service.Common;
using TamTuong.Service.Common.Service;
using TamTuong.Service.PromotionUsageService.Dto;
using TamTuong.Service.PromotionUsageService.Request;

namespace TamTuong.Service.PromotionUsageService
{
    public interface IPromotionUsageService : IService<PromotionUsage>
    {
        public Task<PagedList<PromotionUsageDto>> GetData(PromotionUsageSearch search);
        public Task<PromotionUsageDto> GetDto(Guid id);
    }
}
