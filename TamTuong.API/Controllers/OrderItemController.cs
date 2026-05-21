using Microsoft.AspNetCore.Mvc;
using TamTuong.API.Dto;
using TamTuong.Model.Entities;
using TamTuong.Service.Common;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.OrderItemService;
using TamTuong.Service.OrderItemService.Dto;
using TamTuong.Service.OrderItemService.Request;

namespace TamTuong.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderItemController : Controller
    {
        private readonly ILogger<OrderItemController> _logger;
        private readonly IMapper _mapper;
        private readonly IOrderItemService _orderItemService;
        public OrderItemController(ILogger<OrderItemController> logger, IMapper mapper, IOrderItemService orderItemService)
        {
            _logger = logger;
            _mapper = mapper;
            _orderItemService = orderItemService;
        }
        [HttpGet("{id}")]
        public async Task<DataResponse<OrderItemDto>> Get(Guid id)
        {
            try
            {
                var data = await _orderItemService.GetDto(id);
                return new DataResponse<OrderItemDto>
                {
                    Data = data,
                    Status = true,
                    Message = "Lấy dữ liệu thành công",
                };
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi khi lấy dữ liệu đơn hàng.");
                return new DataResponse<OrderItemDto>
                {
                    Status = false,
                    Message = ex.Message
                };
            }
        }
        [HttpPost("Getdata")]
        public async Task<DataResponse<PagedList<OrderItemDto>>> GetData([FromBody] OrderItemSearch search)
        {
            try
            {
                var data = await _orderItemService.Getdata(search);
                return new DataResponse<PagedList<OrderItemDto>>
                {
                    Data = data,
                    Status = true,
                    Message = "Lấy dữ liệu thành công",
                };
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi khi lấy dữ liệu đơn hàng.");
                return new DataResponse<PagedList<OrderItemDto>>
                {
                    Status = false,
                    Message = ex.Message
                };
            }
        }
        [HttpPost("Create")]
        public async Task<DataResponse<OrderItemDto>> Create([FromBody] OrderItemRequest request)
        {
            try
            {
                var entity = _mapper.Map<OrderItemRequest, OrderItem>(request);
                await _orderItemService.CreateAsync(entity);
                var data = _mapper.Map<OrderItem, OrderItemDto>(entity);
                return new DataResponse<OrderItemDto>
                {
                    Data = data,
                    Status = true,
                    Message = "Tạo dữ liệu thành công",
                };
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi khi tạo dữ liệu đơn hàng.");
                return new DataResponse<OrderItemDto>
                {
                    Status = false,
                    Message = ex.Message
                };
            }
        }
        [HttpPut("Update")]
        public async Task<DataResponse<OrderItemDto>> Update([FromBody] OrderItemRequest request)
        {
            try
            {
                var entity = await _orderItemService.GetByIdAsync(request.Id);
                if (entity == null)
                {
                    return new DataResponse<OrderItemDto> { Data = null, Status = false, Message = "Không tìm thấy dữ liệu đơn hàng." };
                }
                entity = _mapper.Map<OrderItemRequest, OrderItem>(request);
                await _orderItemService.UpdateAsync(entity);
                var data = _mapper.Map<OrderItem, OrderItemDto>(entity);
                return new DataResponse<OrderItemDto>
                {
                    Data = data,
                    Status = true,
                    Message = "Cập nhật dữ liệu thành công",
                };
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi khi cập nhật dữ liệu đơn hàng.");
                return new DataResponse<OrderItemDto>
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
                var existingEntity = await _orderItemService.GetByIdAsync(id);
                if (existingEntity == null)
                {
                    return new DataResponse<bool>
                    {
                        Data = false,
                        Status = false,
                        Message = "Không tìm thấy dữ liệu đơn hàng để xóa.",
                    };
                }
                await _orderItemService.DeleteAsync(existingEntity);
                return new DataResponse<bool>
                {
                    Data = true,
                    Status = true,
                    Message = "Xóa dữ liệu thành công",
                };
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi khi xóa dữ liệu đơn hàng.");
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