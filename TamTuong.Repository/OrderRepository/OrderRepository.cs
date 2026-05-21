using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Repository.Common;

namespace TamTuong.Repository.OrderRepository
{
    public class OrderRepository : Repository<Order>, IOrderRepository
    {
        public OrderRepository(DbContext context) : base(context)
        {
        }
    }
}
