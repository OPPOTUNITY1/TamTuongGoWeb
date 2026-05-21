using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Repository.Common;

namespace TamTuong.Repository.ReviewImageRepository
{
    public class ReviewImageRepository : Repository<ReviewImage>, IReviewImageRepository
    {
        public ReviewImageRepository(DbContext context) : base(context)
        {
        }
    }
}
