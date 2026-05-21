using TamTuong.Model.Entities;
using TamTuong.Service.Common;
using TamTuong.Service.Common.Service;
using TamTuong.Service.OrderService.Dto;
using TamTuong.Service.OrderService.Request;

namespace TamTuong.Service.OrderService
{
    public interface IOrderService : IService<Order>
    {
        public Task<PagedList<OrderDto>> Getdata(OrderSearch search);
        public Task<OrderDto> GetDto(Guid id);
    }
}
