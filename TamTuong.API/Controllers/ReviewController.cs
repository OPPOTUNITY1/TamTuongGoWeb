using Microsoft.AspNetCore.Mvc;
using TamTuong.API.Dto;
using TamTuong.Model.Entities;
using TamTuong.Service.Common;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.ReviewService;
using TamTuong.Service.ReviewService.Dto;
using TamTuong.Service.ReviewService.Request;

namespace TamTuong.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewController : Controller
    {
        private readonly ILogger<ReviewController> _logger;
        private readonly IMapper _mapper;
        private readonly IReviewService _reviewService;
        public ReviewController(ILogger<ReviewController> logger, IMapper mapper, IReviewService reviewService)
        {
            _logger = logger;
            _mapper = mapper;
            _reviewService = reviewService;
        }
        [HttpGet("{id}")]
        public async Task<DataResponse<ReviewDto>> Get(Guid id)
        {
            try
            {
                var data = await _reviewService.GetDto(id);
                return new DataResponse<ReviewDto>
                {
                    Data = data,
                    Status = true,
                    Message = "Lấy dữ liệu đánh giá thành công",
                };
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi khi lấy dữ liệu đánh giá.");
                return new DataResponse<ReviewDto>
                {
                    Status = false,
                    Message = ex.Message
                };
            }
        }
        [HttpPost("GetData")]
        public async Task<DataResponse<PagedList<ReviewDto>>> GetData([FromBody] ReviewSearch search)
        {
            try
            {
                var data = await _reviewService.GetData(search);
                return new DataResponse<PagedList<ReviewDto>>
                {
                    Data = data,
                    Status = true,
                    Message = "Lấy dữ liệu đánh giá thành công",
                };
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi khi lấy dữ liệu đánh giá.");
                return new DataResponse<PagedList<ReviewDto>>
                {
                    Status = false,
                    Message = ex.Message
                };
            }
        }
        [HttpPost("Create")]
        public async Task<DataResponse<ReviewDto>> Create([FromBody] ReviewRequest request)
        {
            try
            {
                var review = _mapper.Map<ReviewRequest, Review>(request);
                await _reviewService.CreateAsync(review);
                var createdReviewDto = _mapper.Map<Review, ReviewDto>(review);
                return new DataResponse<ReviewDto>
                {
                    Data = createdReviewDto,
                    Status = true,
                    Message = "Tạo đánh giá thành công",
                };
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi khi tạo đánh giá.");
                return new DataResponse<ReviewDto>
                {
                    Status = false,
                    Message = ex.Message
                };
            }
        }
        [HttpPut("Update")]
        public async Task<DataResponse<ReviewDto>> Update([FromBody] ReviewRequest request)
        {
            try
            {
                var review = await _reviewService.GetByIdAsync(request.Id);
                if (review != null)
                {
                    _logger.LogWarning("Không tìm thấy đánh giá với ID: {ReviewId}", request.Id);
                }
                review = _mapper.Map<ReviewRequest, Review>(request);
                await _reviewService.UpdateAsync(review);
                var updatedReviewDto = _mapper.Map<Review, ReviewDto>(review);
                return new DataResponse<ReviewDto>
                {
                    Data = updatedReviewDto,
                    Status = true,
                    Message = "Cập nhật đánh giá thành công",
                };
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi khi cập nhật đánh giá.");
                return new DataResponse<ReviewDto>
                {
                    Status = false,
                    Message = ex.Message
                };
            }
        }
        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse<bool>> Delete(Guid id)
        {
            try
            {
                var review = await _reviewService.GetByIdAsync(id);
                if (review == null)
                {
                    return new DataResponse<bool>
                    {
                        Data = false,
                        Status = false,
                        Message = "Không tìm thấy đánh giá để xóa."
                    };
                }
                await _reviewService.DeleteAsync(review);
                return new DataResponse<bool>
                {
                    Data = true,
                    Status = true,
                    Message = "Xóa đánh giá thành công.",
                };
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi khi xóa đánh giá.");
                return new DataResponse<bool>
                {
                    Data = false,
                    Status = false,
                    Message = ex.Message
                };
            }
        }
    }
}