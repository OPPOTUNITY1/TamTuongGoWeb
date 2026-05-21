using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Service.Common;
using TamTuong.Service.Common.Service;
using TamTuong.Service.OrderStatusHistoryService.Dto;
using TamTuong.Service.OrderStatusHistoryService.Request;

namespace TamTuong.Service.OrderStatusHistoryService
{
    public interface IOrderStatusHistoryService : IService<OrderStatusHistory>
    {
        public Task<PagedList<OrderStatusHistoryDto>> GetData(OrderStatusHistorySearch search);
        public Task<OrderStatusHistoryDto> GetDto(Guid id);
    }
}
