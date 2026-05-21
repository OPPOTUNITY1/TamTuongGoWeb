using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Repository.Common;

namespace TamTuong.Repository.ShopRepository
{
    public class ShopRepository : Repository<Shop>, IShopRepository
    {
        public ShopRepository(DbContext context) : base(context)
        {
        }
    }
}
