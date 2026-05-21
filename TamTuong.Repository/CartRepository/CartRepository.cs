using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Repository.Common;

namespace TamTuong.Repository.CartRepository
{
    public class CartRepository : Repository<Cart>, ICartRepository
    {
        public CartRepository(DbContext context) : base(context)
        {
        }
    }
}
