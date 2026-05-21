using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;

namespace TamTuong.Service.ReviewService.Dto
{
    public class ReviewDto : Review
    {
        public List<ReviewImage>? ReviewImages { get; set; }
    }
}
