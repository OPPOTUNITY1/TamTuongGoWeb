using TamTuong.Model.Entities;
using TamTuong.Service.Common;
using TamTuong.Service.Common.Service;
using TamTuong.Service.OrderItemService.Dto;
using TamTuong.Service.OrderItemService.Request;

namespace TamTuong.Service.OrderItemService
{
    public interface IOrderItemService : IService<OrderItem>
    {
        public Task<PagedList<OrderItemDto>> Getdata(OrderItemSearch search);
        public Task<OrderItemDto> GetDto(Guid id);
    }
}
