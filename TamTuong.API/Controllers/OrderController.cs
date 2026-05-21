using Microsoft.AspNetCore.Mvc;
using TamTuong.API.Dto;
using TamTuong.Model.Entities;
using TamTuong.Service.Common;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.OrderService;
using TamTuong.Service.OrderService.Dto;
using TamTuong.Service.OrderService.Request;

namespace TamTuong.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : Controller
    {
        private readonly ILogger<OrderController> _logger;
        private readonly IMapper _mapper;
        private readonly IOrderService _orderService;
        public OrderController(ILogger<OrderController> logger, IMapper mapper, IOrderService orderService)
        {
            _logger = logger;
            _mapper = mapper;
            _orderService = orderService;
        }
        [HttpGet("{id}")]
        public async Task<DataResponse<OrderDto>> GetById(Guid id)
        {
            try
            {
                var data = await _orderService.GetDto(id);
                if (data == null)
                {
                    return new DataResponse<OrderDto> { Status = false, Message = "Không tìm thấy đơn hàng." };
                }
                return new DataResponse<OrderDto> { Data = data, Status = true, Message = "Lấy dữ liệu đơn hàng thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy dữ liệu đơn hàng");
                return new DataResponse<OrderDto> { Status = false, Message = ex.Message };
            }
        }
        [HttpPost("Getdata")]
        public async Task<DataResponse<PagedList<OrderDto>>> GetData([FromBody] OrderSearch search)
        {
            try
            {
                var data = await _orderService.Getdata(search);
                return new DataResponse<PagedList<OrderDto>> { Data = data, Status = true, Message = "Lấy dữ liệu đơn hàng thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy dữ liệu đơn hàng");
                return new DataResponse<PagedList<OrderDto>> { Status = false, Message = ex.Message };
            }
        }
        [HttpPost("Create")]
        public async Task<DataResponse<OrderDto>> Create([FromBody] OrderRequest request)
        {
            try
            {
                var entity = _mapper.Map<OrderRequest, Order>(request);
                await _orderService.CreateAsync(entity);
                var data = _mapper.Map<Order, OrderDto>(entity);
                return new DataResponse<OrderDto> { Data = data, Status = true, Message = "Tạo đơn hàng thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo đơn hàng");
                return new DataResponse<OrderDto> { Status = false, Message = ex.Message };
            }
        }
        [HttpPut("Update")]
        public async Task<DataResponse<OrderDto>> Update([FromBody] OrderRequest request)
        {
            try
            {
                var entity = await _orderService.GetByIdAsync(request.Id);
                if (entity == null)
                {
                    return new DataResponse<OrderDto> { Status = false, Message = "Không tìm thấy đơn hàng." };
                }
                entity = _mapper.Map<OrderRequest, Order>(request);
                await _orderService.UpdateAsync(entity);
                var data = _mapper.Map<Order, OrderDto>(entity);
                return new DataResponse<OrderDto> { Data = data, Status = true, Message = "Cập nhật đơn hàng thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật đơn hàng");
                return new DataResponse<OrderDto> { Status = false, Message = ex.Message };
            }
        }
        [HttpDelete("{id}")]
        public async Task<DataResponse<bool>> Delete(Guid id)
        {
            try
            {
                var existing = await _orderService.GetDto(id);
                if(existing == null)
                {
                    return new DataResponse<bool> { Status = false, Message = "Không tìm thấy đơn hàng." };
                }
                await _orderService.DeleteAsync(existing);
                return new DataResponse<bool> { Data = true, Status = true, Message = "Xóa đơn hàng thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa đơn hàng");
                return new DataResponse<bool> { Status = false, Message = ex.Message };
            }
        }
    }
}