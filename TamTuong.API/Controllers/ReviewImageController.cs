using Microsoft.AspNetCore.Mvc;
using TamTuong.API.Dto;
using TamTuong.Service.Common;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.ReviewImageService;
using TamTuong.Service.ReviewImageService.Dto;
using TamTuong.Service.ReviewImageService.Request;

namespace TamTuong.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewImageController : Controller
    {
        private readonly ILogger<ReviewImageController> _logger;
        private readonly IMapper _mapper;
        private readonly IReviewImageService _reviewImageService;
        public ReviewImageController(ILogger<ReviewImageController> logger, IMapper mapper, IReviewImageService reviewImageService)
        {
            _logger = logger;
            _mapper = mapper;
            _reviewImageService = reviewImageService;
        }
        [HttpGet("Get/{id}")]
        public async Task<DataResponse<ReviewImageDto>> Get(Guid id)
        {
            try
            {
                var data = await _reviewImageService.GetDto(id);
                return new DataResponse<ReviewImageDto>
                {
                    Data = data,
                    Status = true,
                    Message = "Lấy dữ liệu hình ảnh đánh giá thành công",
                };
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi khi lấy dữ liệu hình ảnh đánh giá.");
                return new DataResponse<ReviewImageDto>
                {
                    Status = false,
                    Message = ex.Message
                };
            }
        }
        [HttpPost("Getdata")]
        public async Task<DataResponse<PagedList<ReviewImageDto>>> GetData([FromBody] ReviewImageSearch search)
        {
            try
            {
                var data = await _reviewImageService.GetData(search);
                return new DataResponse<PagedList<ReviewImageDto>>
                {
                    Data = data,
                    Status = true,
                    Message = "Lấy dữ liệu hình ảnh đánh giá thành công",
                };
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi khi lấy dữ liệu hình ảnh đánh giá.");
                return new DataResponse<PagedList<ReviewImageDto>>
                {
                    Status = false,
                    Message = ex.Message
                };
            }
        }
        [HttpPost("Create")]
        public async Task<DataResponse<ReviewImageDto>> Create([FromBody] ReviewImageRequest request)
        {
            try
            {
                var entity = _mapper.Map<ReviewImageRequest, ReviewImageDto>(request);
                await _reviewImageService.CreateAsync(entity);
                var data = await _reviewImageService.GetDto(entity.Id);
                return new DataResponse<ReviewImageDto>
                {
                    Data = data,
                    Status = true,
                    Message = "Tạo hình ảnh đánh giá thành công",
                };
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi khi tạo hình ảnh đánh giá.");
                return new DataResponse<ReviewImageDto>
                {
                    Status = false,
                    Message = ex.Message
                };
            }
        }
        [HttpPut("Update")]
        public async Task<DataResponse<ReviewImageDto>> Update([FromBody] ReviewImageRequest request)
        {
            try
            {
                var entity = await _reviewImageService.GetDto(request.Id.Value);
                if (entity == null)
                {
                    return new DataResponse<ReviewImageDto>
                    {
                        Status = false,
                        Message = "Hình ảnh đánh giá không tồn tại"
                    };
                }
                entity = _mapper.Map<ReviewImageRequest, ReviewImageDto>(request);
                await _reviewImageService.UpdateAsync(entity);
                var data = await _reviewImageService.GetDto(entity.Id);
                return new DataResponse<ReviewImageDto>
                {
                    Data = data,
                    Status = true,
                    Message = "Cập nhật hình ảnh đánh giá thành công",
                };
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi khi cập nhật hình ảnh đánh giá.");
                return new DataResponse<ReviewImageDto>
                {
                    Status = false,
                    Message = ex.Message
                };
            }
        }
        [HttpDelete("Delete")]
        public async Task<DataResponse<bool>> Delete(Guid id)
        {
            try
            {
                var entity = await _reviewImageService.GetByIdAsync(id);
                if (entity == null)
                {
                    return new DataResponse<bool>
                    {
                        Status = false,
                        Message = "Hình ảnh đánh giá không tồn tại"
                    };
                }
                await _reviewImageService.DeleteAsync(entity);
                return new DataResponse<bool>
                {
                    Data = true,
                    Status = true,
                    Message = "Xóa hình ảnh đánh giá thành công",
                };
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi khi xóa hình ảnh đánh giá.");
                return new DataResponse<bool>
                {
                    Status = false,
                    Message = ex.Message
                };
            }
        }
    }
}
