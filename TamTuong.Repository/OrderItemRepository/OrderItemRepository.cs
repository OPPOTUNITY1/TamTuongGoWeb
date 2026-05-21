using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Repository.Common;

namespace TamTuong.Repository.OrderItemRepository
{
    public class OrderItemRepository : Repository<OrderItem>, IOrderItemRepository
    {
        public OrderItemRepository(DbContext context) : base(context)
        {
        }
    }
}
