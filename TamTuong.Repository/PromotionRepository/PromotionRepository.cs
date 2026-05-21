using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Repository.Common;

namespace TamTuong.Repository.PromotionRepository
{
    public class PromotionRepository : Repository<Promotion>, IPromotionRepository
    {
        public PromotionRepository(DbContext context) : base(context)
        {
        }
    }
}
