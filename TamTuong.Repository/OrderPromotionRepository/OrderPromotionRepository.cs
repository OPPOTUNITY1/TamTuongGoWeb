using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Repository.Common;

namespace TamTuong.Repository.OrderPromotionRepository
{
    public class OrderPromotionRepository : Repository<OrderPromotion>, IOrderPromotionRepository
    {
        public OrderPromotionRepository(DbContext context) : base(context)
        {
        }
    }
}
