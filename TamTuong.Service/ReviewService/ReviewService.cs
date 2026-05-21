using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Repository.Common;
using TamTuong.Repository.ReviewImageRepository;
using TamTuong.Repository.ReviewRepository;
using TamTuong.Service.CartService.Dto;
using TamTuong.Service.Common;
using TamTuong.Service.Common.Service;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.ProductService.Dto;
using TamTuong.Service.ReviewImageService.Request;
using TamTuong.Service.ReviewService.Dto;
using TamTuong.Service.ReviewService.Request;

namespace TamTuong.Service.ReviewService
{
    public class ReviewService : Service<Review>, IReviewService
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly IMapper _mapper;
        private readonly IReviewImageRepository _reviewImageRepository;
        public ReviewService(IRepository<Review> repository, IReviewRepository reviewRepository, IReviewImageRepository reviewImageRepository, IMapper mapper) : base(repository)
        {
            _reviewRepository = reviewRepository;
            _reviewImageRepository = reviewImageRepository;
            _mapper = mapper;
        }

        public async Task<ReviewDto> CreateReviewAsync(ReviewRequest request)
        {
            var entity = _mapper.Map<ReviewRequest, Review>(request);
            await CreateAsync(entity);
            if(request.ReviewImages != null && request.ReviewImages.Count > 0)
            {
                foreach(var image in request.ReviewImages.Where(x=> !string.IsNullOrEmpty(x.ImageUrl)))
                {
                    var ri = new ReviewImage
                    {
                        ReviewId = entity.Id,
                        ImageUrl = image.ImageUrl,
                    };
                    _reviewImageRepository.Add(ri);
                }
                    await _reviewImageRepository.SaveAsync();
            }
            var dto = _mapper.Map<Review, ReviewDto>(entity);
            dto.ReviewImages = await _reviewImageRepository.GetQueryable().AsNoTracking().Where(x => x.ReviewId == entity.Id && !x.IsDeleted).ToListAsync();
            return dto;
        }

        public async Task<PagedList<ReviewDto>> GetData(ReviewSearch search)
        {
            try
            {
                var query = _reviewRepository.GetQueryable();
                if(search.UserId != null)
                {
                    query = query.Where(r => r.UserId == search.UserId);
                }
                if(search.ProductId != null)
                {
                    query = query.Where(r => r.ProductId == search.ProductId);
                }
                if(search.OrderId != null)
                {
                    query = query.Where(r => r.OrderId == search.OrderId);
                }
                // Apply server-side filters and ordering before pagination so EF can execute async operations
                var dataQuery = query.Where(x => !x.IsDeleted).OrderByDescending(x => x.CreatedDate);

                // Create a paged result of the entity type (Review) using the EF IQueryable
                var rawPaged = await PagedList<Review>.CreateAsync(dataQuery, search);

                // Map the entity items to DTOs (mapping happens in-memory on the already materialized page)
                var dtoItems = rawPaged.Items.Select(x => _mapper.Map<Review, ReviewDto>(x)).ToList();

                // Return a new PagedList of DTOs preserving paging metadata
                return new PagedList<ReviewDto>(dtoItems, rawPaged.PageIndex, rawPaged.PageSize, rawPaged.TotalCount);
            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }

        public async Task<ReviewDto> GetDto(Guid id)
        {
            try
            {
                var query = await _reviewRepository.GetByIdAsync(id);
                if(query == null)
                {
                    throw new System.Exception("Review not found");
                }
                return _mapper.Map<Review, ReviewDto>(query);
            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }

        public async Task<ReviewDto> UpdateReviewAsync(ReviewRequest request)
        {
            if(request.Id == null || request.Id == Guid.Empty)
            {
                throw new System.Exception("Id đánh giá không hợp lệ");
            }
            var existingReview = await _reviewRepository.GetByIdAsync(request.Id.Value);
            if(existingReview == null)
            {
                throw new System.Exception("Đánh giá không tồn tại");
            }
            _mapper.Map(request, existingReview);
            await UpdateAsync(existingReview);
            var existingImages = await _reviewImageRepository.GetQueryable().Where(x => x.ReviewId == existingReview.Id).ToListAsync();

            var requestImageIds = request.ReviewImages?.Where(i => i.Id != Guid.Empty).Select(i => i.Id).ToHashSet() ?? new HashSet<Guid>();

            // Delete images that exist in DB but not in request
            var toDelete = existingImages.Where(i => !requestImageIds.Contains(i.Id)).ToList();
            if (toDelete.Any())
            {
                // Use repository Delete which performs hard delete
                _reviewImageRepository.Delete(toDelete);
                await _reviewImageRepository.SaveAsync();
            }

            // Add new images from request (Id == Guid.Empty)
            var toAdd = request.ReviewImages?.Where(i => i.Id == Guid.Empty && !string.IsNullOrWhiteSpace(i.ImageUrl)).ToList();
            if (toAdd != null && toAdd.Any())
            {
                foreach (var img in toAdd)
                {
                    _reviewImageRepository.Add(new ReviewImage { ReviewId = existingReview.Id, ImageUrl = img.ImageUrl });
                }
                await _reviewImageRepository.SaveAsync();
            }

            var dto = _mapper.Map<Review, ReviewDto>(existingReview);
            dto.ReviewImages = await _reviewImageRepository.GetQueryable().AsNoTracking().Where(x => x.ReviewId == existingReview.Id).ToListAsync();
            return dto;
        }
    }
}
