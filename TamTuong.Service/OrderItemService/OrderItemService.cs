using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Repository.Common;
using TamTuong.Repository.OrderItemRepository;
using TamTuong.Service.Common;
using TamTuong.Service.Common.Service;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.OrderItemService.Dto;
using TamTuong.Service.OrderItemService.Request;
using TamTuong.Service.OrderStatusHistoryService.Dto;

namespace TamTuong.Service.OrderItemService
{
    public class OrderItemService : Service<OrderItem>, IOrderItemService
    {
        private readonly IOrderItemRepository _orderItemRepository;
        private readonly IMapper _mapper;
        public OrderItemService(IRepository<OrderItem> repository, IOrderItemRepository orderItemRepository, IMapper mapper) : base(repository)
        {
            _orderItemRepository = orderItemRepository;
            _mapper = mapper;
        }

        public async Task<PagedList<OrderItemDto>> Getdata(OrderItemSearch search)
        {
            try
            {
                var query = _orderItemRepository.GetQueryable();
                if(search.OrderId != null)
                {
                    query = query.Where(x => x.OrderId == search.OrderId);
                }
                if(search.ShopId != null)
                {
                    query = query.Where(x => x.ShopId == search.ShopId);
                }
                if(search.ProductId != null)
                {
                    query = query.Where(x => x.ProductId == search.ProductId);
                }
                // Apply server-side filters and ordering before pagination so EF can execute async operations
                var dataQuery = query.Where(x => !x.IsDeleted).OrderByDescending(x => x.CreatedDate);

                // Create a paged result of the entity type (Cart) using the EF IQueryable
                var rawPaged = await PagedList<OrderItem>.CreateAsync(dataQuery, search);

                // Map the entity items to DTOs (mapping happens in-memory on the already materialized page)
                var dtoItems = rawPaged.Items.Select(x => _mapper.Map<OrderItem, OrderItemDto>(x)).ToList();

                // Return a new PagedList of DTOs preserving paging metadata
                return new PagedList<OrderItemDto>(dtoItems, rawPaged.PageIndex, rawPaged.PageSize, rawPaged.TotalCount);

            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }

        public async Task<OrderItemDto> GetDto(Guid id)
        {
            try
            {
                var data = await _orderItemRepository.GetByIdAsync(id);
                if (data == null)
                {
                    throw new System.Exception("Không tìm thấy dữ liệu");
                }
                return _mapper.Map<OrderItem, OrderItemDto>(data);
            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }
    }
}
