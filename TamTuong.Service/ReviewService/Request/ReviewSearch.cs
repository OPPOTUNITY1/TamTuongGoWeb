using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Service.Dto;

namespace TamTuong.Service.ReviewService.Request
{
    public class ReviewSearch :  SearchBase
    {
        public Guid? UserId { get; set; }
        public Guid? ProductId { get; set; }
        public Guid? OrderId { get; set; }
    }
}
