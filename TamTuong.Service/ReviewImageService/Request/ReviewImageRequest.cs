using System;
using System.Collections.Generic;
using System.Text;

namespace TamTuong.Service.ReviewImageService.Request
{
    public class ReviewImageRequest
    {
        public Guid? Id { get; set; }
        public Guid? ReviewId { get; set; }
        public string? ImageUrl { get; set; }
        public int? SortOrder { get; set; }
    }
}
