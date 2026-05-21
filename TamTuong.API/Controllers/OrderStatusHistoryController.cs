using Microsoft.AspNetCore.Mvc;
using TamTuong.API.Dto;
using TamTuong.Model.Entities;
using TamTuong.Service.Common;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.OrderStatusHistoryService;
using TamTuong.Service.OrderStatusHistoryService.Dto;
using TamTuong.Service.OrderStatusHistoryService.Request;

namespace TamTuong.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderStatusHistoryController : Controller
    {
        private readonly ILogger<OrderStatusHistoryController> _logger;
        private readonly IOrderStatusHistoryService _orderStatusHistoryService;
        private readonly IMapper _mapper;
        public OrderStatusHistoryController(IOrderStatusHistoryService orderStatusHistoryService, IMapper mapper, ILogger<OrderStatusHistoryController> logger)
        {
            _orderStatusHistoryService = orderStatusHistoryService;
            _mapper = mapper;
            _logger = logger;
        }
        [HttpGet("{id}")]
        public async Task<DataResponse<OrderStatusHistoryDto>> Get(Guid id)
        {
            try
            {
                var data = await _orderStatusHistoryService.GetDto(id);
                if (data == null)
                {
                    return new DataResponse<OrderStatusHistoryDto> { Status = false, Message = "Không tìm thấy lịch sử trạng thái đơn hàng." };
                }
                return new DataResponse<OrderStatusHistoryDto> { Data = data, Status = true, Message = "Lấy dữ liệu lịch sử trạng thái đơn hàng thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy dữ liệu lịch sử trạng thái đơn hàng");
                return new DataResponse<OrderStatusHistoryDto> { Status = false, Message = ex.Message };
            }
        }
        [HttpPost("Getdata")]
        public async Task<DataResponse<PagedList<OrderStatusHistoryDto>>> GetData([FromBody] OrderStatusHistorySearch search)
        {
            try
            {
                var data = await _orderStatusHistoryService.GetData(search);
                return new DataResponse<PagedList<OrderStatusHistoryDto>> { Data = data, Status = true, Message = "Lấy dữ liệu lịch sử trạng thái đơn hàng thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy dữ liệu lịch sử trạng thái đơn hàng");
                return new DataResponse<PagedList<OrderStatusHistoryDto>> { Status = false, Message = ex.Message };
            }
        }
        [HttpPost("Create")]
        public async Task<DataResponse<OrderStatusHistoryDto>> Create([FromBody] OrderStatusHistoryRequest request)
        {
            try
            {
                var entity = _mapper.Map<OrderStatusHistoryRequest, OrderStatusHistory>(request);
                await _orderStatusHistoryService.CreateAsync(entity);
                var data = _mapper.Map<OrderStatusHistory, OrderStatusHistoryDto>(entity);
                return new DataResponse<OrderStatusHistoryDto> { Data = data, Status = true, Message = "Tạo lịch sử trạng thái đơn hàng thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo lịch sử trạng thái đơn hàng");
                return new DataResponse<OrderStatusHistoryDto> { Status = false, Message = ex.Message };
            }
        }
        [HttpPut("Update")]
        public async Task<DataResponse<OrderStatusHistoryDto>> Update([FromBody] OrderStatusHistoryRequest request)
        {
            try
            {
                var entity = await _orderStatusHistoryService.GetByIdAsync(request.Id);
                if (entity == null)
                {
                    return new DataResponse<OrderStatusHistoryDto> { Data = null, Status = false, Message = "Không tìm thấy lịch sử trạng thái đơn hàng." };
                }
                entity = _mapper.Map<OrderStatusHistoryRequest, OrderStatusHistory>(request);
                await _orderStatusHistoryService.UpdateAsync(entity);
                var data = _mapper.Map<OrderStatusHistory, OrderStatusHistoryDto>(entity);
                return new DataResponse<OrderStatusHistoryDto> { Data = data, Status = true, Message = "Cập nhật lịch sử trạng thái đơn hàng thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật lịch sử trạng thái đơn hàng");
                return new DataResponse<OrderStatusHistoryDto> { Status = false, Message = ex.Message };
            }

        }
        [HttpDelete("{id}")]
        public async Task<DataResponse<bool>> Delete(Guid id)
        {
            try
            {
                var existing = await _orderStatusHistoryService.GetByIdAsync(id);
                var result = _orderStatusHistoryService.DeleteAsync(existing);
                return new DataResponse<bool> { Data = true, Status = true, Message = "Xóa lịch sử trạng thái đơn hàng thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa lịch sử trạng thái đơn hàng");
                return new DataResponse<bool> { Status = false, Message = ex.Message };
            }
        }
    }
}