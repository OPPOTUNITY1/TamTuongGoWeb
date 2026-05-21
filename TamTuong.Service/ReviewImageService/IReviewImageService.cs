using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Service.Common;
using TamTuong.Service.Common.Service;
using TamTuong.Service.ReviewImageService.Dto;
using TamTuong.Service.ReviewImageService.Request;

namespace TamTuong.Service.ReviewImageService
{
    public interface IReviewImageService : IService<ReviewImage>
    {
        public Task<PagedList<ReviewImageDto>> GetData(ReviewImageSearch search);
        public Task<ReviewImageDto> GetDto(Guid id);
    }
}
