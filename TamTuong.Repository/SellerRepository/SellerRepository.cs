using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Repository.Common;

namespace TamTuong.Repository.SellerRepository
{
    public class SellerRepository : Repository<Seller>, ISellerRepository
    {
        public SellerRepository(DbContext context) : base(context)
        {
        }
    }
}
