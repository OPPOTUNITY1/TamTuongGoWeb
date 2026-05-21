using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Repository.Common;
using TamTuong.Repository.ProductImageRepository;
using TamTuong.Repository.PromotionUsageRepository;
using TamTuong.Service.CartService.Dto;
using TamTuong.Service.Common;
using TamTuong.Service.Common.Service;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.PromotionUsageService.Dto;
using TamTuong.Service.PromotionUsageService.Request;

namespace TamTuong.Service.PromotionUsageService
{
    public class PromotionUsageService : Service<PromotionUsage>, IPromotionUsageService
    {
        private readonly IMapper _mapper;
        private readonly IPromotionUsageRepository _promotionUsageRepository;
        public PromotionUsageService(IRepository<PromotionUsage> repository, IPromotionUsageRepository promotionUsageRepository, IMapper mapper) : base(repository)
        {
            _promotionUsageRepository = promotionUsageRepository;
            _mapper = mapper;
        }

        public async Task<PagedList<PromotionUsageDto>> GetData(PromotionUsageSearch search)
        {
            try
            {
                var query = _promotionUsageRepository.GetQueryable();
                if(search.OrderId != null)
                {
                    query = query.Where(x => x.OrderId == search.OrderId);
                }
                if (search.UserId != null)
                {
                    query = query.Where(x => x.UserId == search.UserId);
                }
                if (search.PromotionId != null)
                {
                    query = query.Where(x => x.PromotionId == search.PromotionId);
                }
                // Apply server-side filters and ordering before pagination so EF can execute async operations
                var dataQuery = query.Where(x => !x.IsDeleted).OrderByDescending(x => x.CreatedDate);

                // Create a paged result of the entity type (PromotionUsage) using the EF IQueryable
                var rawPaged = await PagedList<PromotionUsage>.CreateAsync(dataQuery, search);

                // Map the entity items to DTOs (mapping happens in-memory on the already materialized page)
                var dtoItems = rawPaged.Items.Select(x => _mapper.Map<PromotionUsage, PromotionUsageDto>(x)).ToList();

                // Return a new PagedList of DTOs preserving paging metadata
                return new PagedList<PromotionUsageDto>(dtoItems, rawPaged.PageIndex, rawPaged.PageSize, rawPaged.TotalCount);
            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }

        public async Task<PromotionUsageDto> GetDto(Guid id)
        {
            try
            {
                var query = await _promotionUsageRepository.GetByIdAsync(id);
                if(query == null)
                {
                    throw new System.Exception("Không tìm thấy dữ liệu");
                }
                return _mapper.Map<PromotionUsage, PromotionUsageDto>(query);
            }
            catch(System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }
    }
}
