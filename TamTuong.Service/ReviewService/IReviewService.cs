using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Service.Common;
using TamTuong.Service.Common.Service;
using TamTuong.Service.ReviewService.Dto;
using TamTuong.Service.ReviewService.Request;

namespace TamTuong.Service.ReviewService
{
    public interface IReviewService : IService<Review>
    {
        public Task<PagedList<ReviewDto>> GetData(ReviewSearch search);
        public Task<ReviewDto> GetDto(Guid id);
        public Task<ReviewDto> CreateReviewAsync(ReviewRequest request);
        public Task<ReviewDto> UpdateReviewAsync(ReviewRequest request);
    }
}
