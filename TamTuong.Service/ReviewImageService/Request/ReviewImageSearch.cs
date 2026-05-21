using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Service.Dto;

namespace TamTuong.Service.ReviewImageService.Request
{
    public class ReviewImageSearch : SearchBase
    {
        public Guid? ReviewId { get; set; }
    }
}
