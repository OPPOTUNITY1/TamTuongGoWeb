using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;

namespace TamTuong.Service.ReviewService.Request
{
    public class ReviewRequest 
    {
        public Guid? Id { get; set; }
        public Guid? UserId { get; set; }
        public Guid? ProductId { get; set; }
        public Guid? OrderId { get; set; }
        public int? Rating { get; set; }
        public string? Comment { get; set; }
        public List<ReviewImage>? ReviewImages { get; set; }
    }
}
