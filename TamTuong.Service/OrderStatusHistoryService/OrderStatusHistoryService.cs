using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Repository.Common;
using TamTuong.Repository.OrderStatusHistoryRepository;
using TamTuong.Service.CartService.Dto;
using TamTuong.Service.Common;
using TamTuong.Service.Common.Service;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.Extensions;
using TamTuong.Service.OrderStatusHistoryService.Dto;
using TamTuong.Service.OrderStatusHistoryService.Request;

namespace TamTuong.Service.OrderStatusHistoryService
{
    public class OrderStatusHistoryService : Service<OrderStatusHistory>, IOrderStatusHistoryService
    {
        private readonly IOrderStatusHistoryRepository _orderStatusHistoryRepository;
        private readonly IMapper _mapper;
        public OrderStatusHistoryService(IOrderStatusHistoryRepository orderStatusHistoryRepository, IMapper mapper) : base(orderStatusHistoryRepository)
        {
            _orderStatusHistoryRepository = orderStatusHistoryRepository;
            _mapper = mapper;
        }

        public async Task<PagedList<OrderStatusHistoryDto>> GetData(OrderStatusHistorySearch search)
        {
            try
            {
                var query = _orderStatusHistoryRepository.GetQueryable();
                if (search.OrderId.HasValue || search.OrderId != null)
                {
                    query = query.Where(x => x.OrderId == search.OrderId.Value);
                }
                if(!string.IsNullOrEmpty(search.Status))
                {
                    query = query.Where(x => x.Status == search.Status);
                }
                // Apply server-side filters and ordering before pagination so EF can execute async operations
                var dataQuery = query.Where(x => !x.IsDeleted).OrderByDescending(x => x.CreatedDate);

                // Create a paged result of the entity type (Cart) using the EF IQueryable
                var rawPaged = await PagedList<OrderStatusHistory>.CreateAsync(dataQuery, search);

                // Map the entity items to DTOs (mapping happens in-memory on the already materialized page)
                var dtoItems = rawPaged.Items.Select(x => _mapper.Map<OrderStatusHistory, OrderStatusHistoryDto>(x)).ToList();

                // Return a new PagedList of DTOs preserving paging metadata
                return new PagedList<OrderStatusHistoryDto>(dtoItems, rawPaged.PageIndex, rawPaged.PageSize, rawPaged.TotalCount);

            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }


        public async Task<OrderStatusHistoryDto> GetDto(Guid id)
        {
            try
            {
                var query = await _orderStatusHistoryRepository.GetByIdAsync(id);
                if (query == null)
                {
                    throw new System.Exception("Không tìm thấy dữ liệu.");
                }
                return _mapper.Map<OrderStatusHistory, OrderStatusHistoryDto>(query);
            }
            catch(System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }
    }
}
