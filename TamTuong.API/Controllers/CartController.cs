using DocumentFormat.OpenXml.Drawing.Charts;
using Google.Protobuf;
using Grpc.Core;
using Microsoft.AspNetCore.Mvc;
using TamTuong.API.Dto;
using TamTuong.Model.Entities;
using TamTuong.Service.CartService;
using TamTuong.Service.CartService.Dto;
using TamTuong.Service.CartService.Request;
using TamTuong.Service.CategoryService.Dto;
using TamTuong.Service.Common;
using TamTuong.Service.Core.Mapper;

namespace TamTuong.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : Controller
    {
        private readonly ILogger<CartController> _logger;
        private readonly ICartService _cartService;
        private readonly IMapper _mapper;
        public CartController(ILogger<CartController> logger, ICartService cartService, IMapper mapper)
        {
            _logger = logger;
            _cartService = cartService;
            _mapper = mapper;
        }
        [HttpPost("Create")]
        public async Task<DataResponse<CartDto>> Create([FromBody] CartRequest request)
        {
            try
            {
                var entity = _mapper.Map<CartRequest, Cart>(request);
                await _cartService.CreateAsync(entity);
                var data = _mapper.Map<Cart, CartDto>(entity);
                return new DataResponse<CartDto> { Data = data, Status = true, Message = "Thêm vào giỏ hàng thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi thêm vào giỏ hàng");
                return new DataResponse<CartDto> { Status = false, Message = ex.Message };
            }
        }
        [HttpPut("Update")]
        public async Task<DataResponse<CartDto>> Update([FromBody] CartRequest request)
        {
            try
            {
                if (!request.Id.HasValue)
                    return new DataResponse<CartDto> { Status = false, Message = "Id không hợp lệ." };

                var entity = await _cartService.GetByIdAsync(request.Id);
                if (entity == null)
                    return new DataResponse<CartDto> { Status = false, Message = "Không tìm thấy giỏ hàng." };

                entity.Quantity = request.Quantity;
                await _cartService.UpdateAsync(entity);
                var data = _mapper.Map<Cart, CartDto>(entity);
                return new DataResponse<CartDto> { Data = data, Status = true, Message = "Cập nhật giỏ hàng thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật giỏ hàng");
                return new DataResponse<CartDto> { Status = false, Message = ex.Message };
            }
        }
        [HttpPost("GetData")]
        public async Task<DataResponse<PagedList<CartDto>>> GetData([FromBody] CartSearch search)
        {
            try
            {
                var data = await _cartService.Getdata(search);
                return new DataResponse<PagedList<CartDto>> { Data = data, Status = true, Message = "Lấy dữ liệu giỏ hàng thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy dữ liệu giỏ hàng");
                return new DataResponse<PagedList<CartDto>> { Status = false, Message = ex.Message };
            }
        }
        [HttpGet("Getdata/{id}")]
        public async Task<DataResponse<CartDto>> GetData(Guid id)
        {
            try
            {
                var data = await _cartService.GetDto(id);
                if (data == null)
                {
                    return new DataResponse<CartDto> { Status = false, Message = "Không tìm thấy dữ liệu giỏ hàng." };
                }
                return new DataResponse<CartDto> { Data = data, Status = true, Message = "Lấy dữ liệu giỏ hàng thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy dữ liệu giỏ hàng");
                return new DataResponse<CartDto> { Status = false, Message = ex.Message };
            }
        }
        [HttpDelete("Remove/{id}")]
        public async Task<DataResponse<CartDto>> Remove(Guid id)
        {
            try
            {
                var data = await _cartService.RemoveCart(id);
                if (data == null)
                {
                    return new DataResponse<CartDto> { Status = false, Message = "Không tìm thấy dữ liệu giỏ hàng." };
                }
                return new DataResponse<CartDto> { Data = data, Status = true, Message = "Xóa giỏ hàng thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa giỏ hàng");
                return new DataResponse<CartDto> { Status = false, Message = ex.Message };
            }
        }
    }
}