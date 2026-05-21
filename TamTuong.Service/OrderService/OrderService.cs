using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Repository.Common;
using TamTuong.Repository.OrderRepository;
using TamTuong.Service.Common;
using TamTuong.Service.Common.Service;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.OrderService.Dto;
using TamTuong.Service.OrderService.Request;
using TamTuong.Service.OrderStatusHistoryService.Dto;

namespace TamTuong.Service.OrderService
{
    public class OrderService : Service<Order>, IOrderService
    {
        private readonly IRepository<Order> _repository;
        private readonly IOrderRepository _orderRepository;
        private readonly IMapper _mapper;
        public OrderService(IRepository<Order> repository, IOrderRepository orderRepository, IMapper mapper) : base(repository)
        {
            _repository = repository;
            _orderRepository = orderRepository;
            _mapper = mapper;
        }

        public async Task<PagedList<OrderDto>> Getdata(OrderSearch search)
        {
            try
            {
                var entities = _orderRepository.GetQueryable();
                if (search.UserId != null)
                {
                    entities = entities.Where(x => x.UserId == search.UserId);
                }
                if (search.UserInformationId != null)
                {
                    entities = entities.Where(x => x.UserInformationId == search.UserInformationId);
                }
                if(search.OrderDateFrom != null && search.OrderDateTo != null)
                {
                    entities = entities.Where(x => x.OrderDate >= search.OrderDateFrom && x.OrderDate <= search.OrderDateTo);
                }
                if (search.Status != null)
                {
                    entities = entities.Where(x => x.Status == search.Status);
                }
                // Apply server-side filters and ordering before pagination so EF can execute async operations
                var dataQuery = entities.Where(x => !x.IsDeleted).OrderByDescending(x => x.CreatedDate);

                // Create a paged result of the entity type (Cart) using the EF IQueryable
                var rawPaged = await PagedList<Order>.CreateAsync(dataQuery, search);

                // Map the entity items to DTOs (mapping happens in-memory on the already materialized page)
                var dtoItems = rawPaged.Items.Select(x => _mapper.Map<Order, OrderDto>(x)).ToList();

                // Return a new PagedList of DTOs preserving paging metadata
                return new PagedList<OrderDto>(dtoItems, rawPaged.PageIndex, rawPaged.PageSize, rawPaged.TotalCount);
            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }

        public async Task<OrderDto> GetDto(Guid id)
        {
            try
            {
                var query= await _orderRepository.GetByIdAsync(id);
                if (query == null)
                {
                    throw new System.Exception("Không tìm thấy dữ liệu");
                }
                return _mapper.Map<Order, OrderDto>(query);
            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }
    }
}
