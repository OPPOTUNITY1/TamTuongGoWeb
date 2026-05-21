using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Repository.Common;
using TamTuong.Repository.ReviewImageRepository;
using TamTuong.Service.CartService.Dto;
using TamTuong.Service.Common;
using TamTuong.Service.Common.Service;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.ReviewImageService.Dto;
using TamTuong.Service.ReviewImageService.Request;

namespace TamTuong.Service.ReviewImageService
{
    public class ReviewImageService : Service<ReviewImage>, IReviewImageService
    {
        private readonly IReviewImageRepository _reviewImageRepository;
        private readonly IMapper _mapper;
        public ReviewImageService(IRepository<ReviewImage> repository, IReviewImageRepository reviewImageRepository, IMapper mapper) : base(repository)
        {
            _reviewImageRepository = reviewImageRepository;
            _mapper = mapper;
        }

        public async Task<PagedList<ReviewImageDto>> GetData(ReviewImageSearch search)
        {
            try
            {
                var query = _reviewImageRepository.GetQueryable();
                if(search.ReviewId != null)
                {
                    query = query.Where(x => x.ReviewId == search.ReviewId);
                }
                // Apply server-side filters and ordering before pagination so EF can execute async operations
                var dataQuery = query.Where(x => !x.IsDeleted).OrderByDescending(x => x.CreatedDate);

                // Create a paged result of the entity type (ReviewImage) using the EF IQueryable
                var rawPaged = await PagedList<ReviewImage>.CreateAsync(dataQuery, search);

                // Map the entity items to DTOs (mapping happens in-memory on the already materialized page)
                var dtoItems = rawPaged.Items.Select(x => _mapper.Map<ReviewImage, ReviewImageDto>(x)).ToList();

                // Return a new PagedList of DTOs preserving paging metadata
                return new PagedList<ReviewImageDto>(dtoItems, rawPaged.PageIndex, rawPaged.PageSize, rawPaged.TotalCount);
            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }

        public async Task<ReviewImageDto> GetDto(Guid id)
        {
            try
            {
                var query = await _reviewImageRepository.GetByIdAsync(id);
                if (query == null || query.IsDeleted)
                {
                    throw new System.Exception("Không tìm thấy dữ liệu");
                }
                return _mapper.Map<ReviewImage, ReviewImageDto>(query);
            }
            catch(System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }

        }
    }
}
