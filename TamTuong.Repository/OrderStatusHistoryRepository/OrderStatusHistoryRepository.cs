using Microsoft.EntityFrameworkCore;
using TamTuong.Model.Entities;
using TamTuong.Repository.Common;

namespace TamTuong.Repository.OrderStatusHistoryRepository
{
    public class OrderStatusHistoryRepository : Repository<OrderStatusHistory>, IOrderStatusHistoryRepository
    {
        public OrderStatusHistoryRepository(DbContext context) : base(context)
        {
        }
    }
}
