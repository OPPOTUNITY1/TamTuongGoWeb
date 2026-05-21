using MongoDB.Driver.Linq;
using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Repository.Common;
using TamTuong.Repository.OrderPromotionRepository;
using TamTuong.Service.Common;
using TamTuong.Service.Common.Service;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.OrderPromotionService.Dto;
using TamTuong.Service.OrderPromotionService.Request;
using TamTuong.Service.OrderStatusHistoryService.Dto;

namespace TamTuong.Service.OrderPromotionService
{
    public class OrderPromotionService : Service<OrderPromotion>, IOrderPromotionService
    {
        private readonly IOrderPromotionRepository _orderPromotionRepository;
        private readonly IMapper _mapper;
        public OrderPromotionService(IRepository<OrderPromotion> repository, IOrderPromotionRepository orderPromotionRepository, IMapper mapper) : base(repository)
        {
            _orderPromotionRepository = orderPromotionRepository;
            _mapper = mapper;
        }

        public async Task<PagedList<OrderPromotionDto>> Getdata(OrderPromotionSearch search)
        {
            try
            {
                var query = _orderPromotionRepository.GetQueryable();
                if(search.OrderId != null)
                {
                    query = query.Where(op => op.OrderId == search.OrderId);
                }
                if(search.PromotionId != null)
                {
                    query = query.Where(op => op.PromotionId == search.PromotionId);
                }
                if(search.ShopId != null)
                {
                    query = query.Where(op => op.ShopId == search.ShopId);
                }
                // Apply server-side filters and ordering before pagination so EF can execute async operations
                var dataQuery = query.Where(x => !x.IsDeleted).OrderByDescending(x => x.CreatedDate);

                // Create a paged result of the entity type (OrderPromotion) using the EF IQueryable
                var rawPaged = await PagedList<OrderPromotion>.CreateAsync(dataQuery, search);

                // Map the entity items to DTOs (mapping happens in-memory on the already materialized page)
                var dtoItems = rawPaged.Items.Select(x => _mapper.Map<OrderPromotion, OrderPromotionDto>(x)).ToList();

                // Return a new PagedList of DTOs preserving paging metadata
                return new PagedList<OrderPromotionDto>(dtoItems, rawPaged.PageIndex, rawPaged.PageSize, rawPaged.TotalCount);

            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }

        public async Task<OrderPromotionDto> GetDto(Guid id)
        {
            try
            {
                var query = _orderPromotionRepository.GetQueryable().Where(op => op.Id == id && !op.IsDeleted);
                if(query == null)
                {
                    throw new System.Exception("Không tìm thấy dữ liệu");
                }
                var data = await query.FirstOrDefaultAsync();
                return _mapper.Map<OrderPromotion, OrderPromotionDto>(data);
            }
            catch(System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }
    }
}
