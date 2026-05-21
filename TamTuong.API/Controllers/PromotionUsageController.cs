using Microsoft.AspNetCore.Mvc;
using TamTuong.API.Dto;
using TamTuong.Model.Entities;
using TamTuong.Service.Common;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.PromotionUsageService;
using TamTuong.Service.PromotionUsageService.Dto;
using TamTuong.Service.PromotionUsageService.Request;

namespace TamTuong.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PromotionUsageController : Controller
    {
        private readonly ILogger<PromotionUsageController> _logger;
        private readonly IMapper _mapper;
        private readonly IPromotionUsageService _promotionUsageService;
        public PromotionUsageController(ILogger<PromotionUsageController> logger, IMapper mapper, IPromotionUsageService promotionUsageService)
        {
            _logger = logger;
            _mapper = mapper;
            _promotionUsageService = promotionUsageService;
        }
        [HttpGet("Get/{id}")]
        public async Task<DataResponse<PromotionUsageDto>> Get(Guid id)
        {
            try
            {
                var data = await _promotionUsageService.GetDto(id);
                return new DataResponse<PromotionUsageDto>
                {
                    Data = data,
                    Status = true,
                    Message = "Lấy dữ liệu thành công",
                };
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi khi lấy dữ liệu.");
                return new DataResponse<PromotionUsageDto>
                {
                    Status = false,
                    Message = ex.Message
                };
            }
        }
        [HttpPost("Getdata")]
        public async Task<DataResponse<PagedList<PromotionUsageDto>>> GetData([FromBody] PromotionUsageSearch search)
        {
            try
            {
                var data = await _promotionUsageService.GetData(search);
                return new DataResponse<PagedList<PromotionUsageDto>>
                {
                    Data = data,
                    Status = true,
                    Message = "Lấy dữ liệu thành công",
                };
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi khi lấy dữ liệu.");
                return new DataResponse<PagedList<PromotionUsageDto>>
                {
                    Status = false,
                    Message = ex.Message
                };
            }

        }
        [HttpPost("Create")]
        public async Task<DataResponse<PromotionUsageDto>> Create([FromBody] PromotionUsageRequest request)
        {
            try
            {
                var entity = _mapper.Map<PromotionUsageRequest, PromotionUsage>(request);
                await _promotionUsageService.CreateAsync(entity);
                var data = _mapper.Map<PromotionUsage, PromotionUsageDto>(entity);
                return new DataResponse<PromotionUsageDto>
                {
                    Data = data,
                    Status = true,
                    Message = "Tạo dữ liệu thành công",
                };
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi khi tạo dữ liệu.");
                return new DataResponse<PromotionUsageDto>
                {
                    Status = false,
                    Message = ex.Message
                };
            }
        }
        [HttpPut("Update")]
        public async Task<DataResponse<PromotionUsageDto>> Update([FromBody] PromotionUsageRequest request)
        {
            try
            {
                var entity = await _promotionUsageService.GetByIdAsync(request.Id);
                if (entity == null)
                {
                    return new DataResponse<PromotionUsageDto>
                    {
                        Data = null,
                        Status = false,
                        Message = "Dữ liệu không tồn tại."
                    };
                }
                entity = _mapper.Map<PromotionUsageRequest, PromotionUsage>(request);
                await _promotionUsageService.UpdateAsync(entity);
                var data = _mapper.Map<PromotionUsage, PromotionUsageDto>(entity);
                return new DataResponse<PromotionUsageDto>
                {
                    Data = data,
                    Status = true,
                    Message = "Cập nhật dữ liệu thành công",
                };
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi khi cập nhật dữ liệu.");
                return new DataResponse<PromotionUsageDto>
                {
                    Status = false,
                    Message = ex.Message
                };
            }
        }
        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _promotionUsageService.GetByIdAsync(id);
                if (entity == null)
                {
                    return new DataResponse { Status = false, Message = "Dữ liệu không tồn tại." };
                }

                await _promotionUsageService.DeleteAsync(entity);
                return new DataResponse { Status = true, Message = "Xóa dữ liệu thành công." };
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi khi xóa dữ liệu.");
                return new DataResponse { Status = false, Message = ex.Message };
            }
        }
    }
}