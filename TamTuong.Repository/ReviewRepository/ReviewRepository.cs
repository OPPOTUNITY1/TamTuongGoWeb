using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Repository.Common;

namespace TamTuong.Repository.ReviewRepository
{
    public class ReviewRepository : Repository<Review>, IReviewRepository
    {
        public ReviewRepository(DbContext context) : base(context)
        {
        }
    }
}
