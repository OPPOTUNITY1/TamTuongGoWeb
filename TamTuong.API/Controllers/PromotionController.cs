using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TamTuong.API.Dto;
using TamTuong.Model.Entities;
using TamTuong.Service.Common;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.PromotionService;
using TamTuong.Service.PromotionService.Dto;
using TamTuong.Service.PromotionService.Request;

namespace TamTuong.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PromotionController : Controller
    {
        private readonly ILogger<PromotionController> _logger;
        private readonly IMapper _mapper;
        private readonly IPromotionService _promotionService;
        public PromotionController(ILogger<PromotionController> logger, IMapper mapper, IPromotionService promotionService)
        {
            _logger = logger;
            _mapper = mapper;
            _promotionService = promotionService;
        }
        [HttpGet("Get/{id}")]
        public async Task<DataResponse<PromotionDto>> Get(Guid id)
        {
            try
            {
                var data = await _promotionService.GetDto(id);
                if (data == null)
                {
                    return new DataResponse<PromotionDto> { Status = false, Message = "Không tìm thấy khuyến mãi." };
                }
                return new DataResponse<PromotionDto> { Data = data, Status = true, Message = "Lấy dữ liệu khuyến mãi thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy dữ liệu khuyến mãi");
                return new DataResponse<PromotionDto> { Status = false, Message = ex.Message };
            }
        }
        [HttpPost("Getdata")]
        public async Task<DataResponse<PagedList<PromotionDto>>> GetData([FromBody] PromotionSearch search)
        {
            try
            {
                var data = await _promotionService.GetData(search);
                return new DataResponse<PagedList<PromotionDto>> { Data = data, Status = true, Message = "Lấy dữ liệu khuyến mãi thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy dữ liệu khuyến mãi");
                return new DataResponse<PagedList<PromotionDto>> { Status = false, Message = ex.Message };
            }
        }
        [Authorize(Roles = "Seller")]
        [HttpPost("Create")]
        public async Task<DataResponse<PromotionDto>> Create([FromBody] PromotionRequest request)
        {
            try
            {
                var entity = _mapper.Map<PromotionRequest, Promotion>(request);
                await _promotionService.CreateAsync(entity);
                var data = _mapper.Map<Promotion, PromotionDto>(entity);
                return new DataResponse<PromotionDto> { Data = data, Status = true, Message = "Tạo khuyến mãi thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo khuyến mãi");
                return new DataResponse<PromotionDto> { Status = false, Message = ex.Message };
            }
        }
        [Authorize(Roles = "Seller")]
        [HttpPut("Update")]
        public async Task<DataResponse<PromotionDto>> Update([FromBody] PromotionRequest request)
        {
            try
            {
                var entity = await _promotionService.GetByIdAsync(request.Id);
                if (entity == null)
                {
                    return new DataResponse<PromotionDto> { Status = false, Message = "Không tìm thấy khuyến mãi." };
                }
                entity = _mapper.Map<PromotionRequest, Promotion>(request);
                await _promotionService.UpdateAsync(entity);
                var data = _mapper.Map<Promotion, PromotionDto>(entity);
                return new DataResponse<PromotionDto> { Data = data, Status = true, Message = "Cập nhật khuyến mãi thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật khuyến mãi");
                return new DataResponse<PromotionDto> { Status = false, Message = ex.Message };
            }
        }
        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse<bool>> Delete(Guid id)
        {
            try
            {
                var existing = await _promotionService.GetDto(id);
                if (existing == null)
                {
                    return new DataResponse<bool> { Data = false, Status = false, Message = "Không tìm thấy khuyến mãi." };
                }
                await _promotionService.DeleteAsync(existing);
                return new DataResponse<bool> { Data = true, Status = true, Message = "Xóa khuyến mãi thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa khuyến mãi");
                return new DataResponse<bool> { Data = false, Status = false, Message = ex.Message };
            }
        }
    }
}