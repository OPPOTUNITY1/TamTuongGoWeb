using Microsoft.AspNetCore.Mvc;
using TamTuong.API.Dto;
using TamTuong.Model.Entities;
using TamTuong.Service.Common;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.OrderPromotionService;
using TamTuong.Service.OrderPromotionService.Dto;
using TamTuong.Service.OrderPromotionService.Request;

namespace TamTuong.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderPromotionController : Controller
    {
        private readonly ILogger<OrderPromotionController> _logger;
        private readonly IMapper _mapper;
        private readonly IOrderPromotionService _orderPromotionService;
        public OrderPromotionController(ILogger<OrderPromotionController> logger, IMapper mapper, IOrderPromotionService orderPromotionService)
        {
            _logger = logger;
            _mapper = mapper;
            _orderPromotionService = orderPromotionService;
        }
        [HttpGet("Get/{id}")]
        public async Task<DataResponse<OrderPromotionDto>> Get(Guid id)
        {
            try
            {
                var data = await _orderPromotionService.GetDto(id);
                return new DataResponse<OrderPromotionDto>
                {
                    Data = data,
                    Status = true,
                    Message = "Lấy dữ liệu thành công",
                };
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi khi lấy dữ liệu khuyến mãi đơn hàng.");
                return new DataResponse<OrderPromotionDto>
                {
                    Status = false,
                    Message = ex.Message
                };
            }
        }
        [HttpPost("Getdata")]
        public async Task<DataResponse<PagedList<OrderPromotionDto>>> GetData([FromBody] OrderPromotionSearch search)
        {
            try
            {
                var data = await _orderPromotionService.Getdata(search);
                return new DataResponse<PagedList<OrderPromotionDto>>
                {
                    Data = data,
                    Status = true,
                    Message = "Lấy dữ liệu thành công",
                };
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi khi lấy dữ liệu khuyến mãi đơn hàng.");
                return new DataResponse<PagedList<OrderPromotionDto>>
                {
                    Status = false,
                    Message = ex.Message
                };
            }
        }
        [HttpPost("Create")]
        public async Task<DataResponse<OrderPromotionDto>> Create([FromBody] OrderPromotionRequest request)
        {
            try
            {
                var entity = _mapper.Map<OrderPromotionRequest, OrderPromotion>(request);
                await _orderPromotionService.CreateAsync(entity);
                var data = _mapper.Map<OrderPromotion, OrderPromotionDto>(entity);
                return new DataResponse<OrderPromotionDto>
                {
                    Data = data,
                    Status = true,
                    Message = "Tạo dữ liệu thành công",
                };
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi khi tạo dữ liệu khuyến mãi đơn hàng.");
                return new DataResponse<OrderPromotionDto>
                {
                    Status = false,
                    Message = ex.Message
                };
            }
        }
        [HttpPut("Update")]
        public async Task<DataResponse<OrderPromotionDto>> Update([FromBody] OrderPromotionRequest request)
        {
            try
            {
                var entity = await _orderPromotionService.GetByIdAsync(request.Id);
                if (entity == null)
                {
                    return new DataResponse<OrderPromotionDto> { Data = null, Status = false, Message = "Không tìm thấy dữ liệu khuyến mãi đơn hàng." };
                }
                entity = _mapper.Map<OrderPromotionRequest, OrderPromotion>(request);
                await _orderPromotionService.UpdateAsync(entity);
                var data = _mapper.Map<OrderPromotion, OrderPromotionDto>(entity);
                return new DataResponse<OrderPromotionDto>
                {
                    Data = data,
                    Status = true,
                    Message = "Cập nhật dữ liệu thành công",
                };
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi khi cập nhật dữ liệu khuyến mãi đơn hàng.");
                return new DataResponse<OrderPromotionDto>
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
                var existingEntity = await _orderPromotionService.GetByIdAsync(id);
                await _orderPromotionService.DeleteAsync(existingEntity);
                return new DataResponse<bool>
                {
                    Data = true,
                    Status = true,
                    Message = "Xóa dữ liệu thành công",
                };
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi khi xóa dữ liệu khuyến mãi đơn hàng.");
                return new DataResponse<bool>
                {
                    Status = false,
                    Message = ex.Message
                };
            }
        }
    }
}