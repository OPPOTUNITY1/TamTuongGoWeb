using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Repository.Common;
using TamTuong.Repository.PromotionRepository;
using TamTuong.Service.Common;
using TamTuong.Service.Common.Service;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.PromotionService.Dto;
using TamTuong.Service.PromotionService.Request;

namespace TamTuong.Service.PromotionService
{
    public class PromotionService : Service<Promotion>, IPromotionService
    {
        private readonly IMapper _mapper;
        private readonly IPromotionRepository _promotionRepository;
        public PromotionService(IRepository<Promotion> repository, IMapper mapper, IPromotionRepository promotionRepository) : base(repository)
        {
            _mapper = mapper;
            _promotionRepository = promotionRepository;
        }

        public async Task<PagedList<PromotionDto>> GetData(PromotionSearch search)
        {
            try
            {
                var query = _promotionRepository.GetQueryable();
                if (search.ShopId != null || search.ShopId.HasValue)
                {
                    query = query.Where(x => x.ShopId == search.ShopId);
                }

                // Ensure ordering and that deleted items are excluded (GetQueryable already filters IsDeleted)
                query = query.OrderByDescending(x => x.CreatedDate);

                // Use the EF IQueryable for counting and paging to keep async provider support
                var totalCount = await query.CountAsync();

                search.PageIndex = search.PageIndex < 1 ? 1 : search.PageIndex;

                List<Promotion> entities;
                if (search.PageSize == -1)
                {
                    entities = await query.ToListAsync();
                }
                else
                {
                    entities = await query.Skip((search.PageIndex - 1) * search.PageSize).Take(search.PageSize).ToListAsync();
                }

                var items = entities.Select(x => _mapper.Map<Promotion, PromotionDto>(x)).ToList();

                // Construct PagedList directly to avoid calling async EF methods on an in-memory IQueryable
                var pageSize = search.PageSize == -1 ? items.Count : search.PageSize;
                return new PagedList<PromotionDto>(items, search.PageIndex, pageSize, totalCount);
            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }

        public async Task<PromotionDto> GetDto(Guid id)
        {
            try
            {
                var query =await _promotionRepository.GetByIdAsync(id);
                if (query == null)
                {
                    throw new System.Exception("Không tìm thấy khuyến mãi");
                }
                return _mapper.Map<Promotion, PromotionDto>(query);
            }
            catch(System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }
    }
}
