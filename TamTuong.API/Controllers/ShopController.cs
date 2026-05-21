using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TamTuong.API.Dto;
using TamTuong.Model.Entities;
using TamTuong.Service.Common;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.ShopService;
using TamTuong.Service.ShopService.Dto;
using TamTuong.Service.ShopService.Request;

namespace TamTuong.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ShopController : Controller
    {
        private readonly ILogger<ShopController> _logger;
        private readonly IShopService _shopService;
        private readonly Mapper _mapper;

        public ShopController(ILogger<ShopController> logger, IShopService shopService, Mapper mapper)
        {
            _logger = logger;
            _shopService = shopService;
            _mapper = mapper;
        }

        [Authorize(Roles = "Seller")]
        [HttpPost("Create")]
        public async Task<DataResponse<ShopDto>> Create(ShopRequestDto request)
        {
            try
            {
                if(await _shopService.IsShopNameExist(request.SellerId,request.Name))
                {
                    return new DataResponse<ShopDto> { Data = null, Status = false, Message = "Tên cửa hàng đã tồn tại." };
                }
                var entity = _mapper.Map<ShopRequestDto, Shop>(request);
                await _shopService.CreateAsync(entity);
                var data = _mapper.Map<Shop, ShopDto>(entity);
                return new DataResponse<ShopDto> { Data = data, Status = true, Message = "Tạo dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo shop");
                return new DataResponse<ShopDto>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi tạo dữ liệu."
                };
            }
        }

        [Authorize(Roles = "Seller")]
        [HttpPut("Update")]
        public async Task<DataResponse<ShopDto>> Update(ShopRequestDto request)
        {
            try
            {
                if (request.Id == null || request.Id == Guid.Empty)
                    return new DataResponse<ShopDto> { Data = null, Status = false, Message = "Id không hợp lệ." };

                var entity = await _shopService.GetByIdAsync(request.Id);
                if (entity == null)
                    return new DataResponse<ShopDto> { Data = null, Status = false, Message = "Không tìm thấy Shop." };

                if (await _shopService.IsShopNameExist(request.SellerId, request.Name, request.Id))
                    return new DataResponse<ShopDto> { Data = null, Status = false, Message = "Tên cửa hàng đã tồn tại." };

                entity.Name = request.Name;

                await _shopService.UpdateAsync(entity);
                var data = _mapper.Map<Shop, ShopDto>(entity);
                return new DataResponse<ShopDto> { Data = data, Status = true, Message = "Cập nhật dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật shop");
                return new DataResponse<ShopDto>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi cập nhật dữ liệu."
                };
            }
        }

        [HttpPost("GetData")]
        public async Task<DataResponse<PagedList<ShopDto>>> GetData([FromBody] ShopSearchDto search)
        {
            try
            {
                var data = await _shopService.GetData(search ?? new ShopSearchDto());
                return new DataResponse<PagedList<ShopDto>> { Data = data, Status = true, Message = "Tìm kiếm dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tìm kiếm shop");
                return new DataResponse<PagedList<ShopDto>>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi tìm kiếm dữ liệu."
                };
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<ShopDto>> Get(Guid id)
        {
            try
            {
                var data = await _shopService.GetDto(id);
                return new DataResponse<ShopDto> { Data = data, Status = true, Message = "Tìm kiếm dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tìm kiếm shop");
                return new DataResponse<ShopDto>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi tìm kiếm dữ liệu."
                };
            }
        }

        [Authorize(Roles = "Seller")]
        [HttpDelete("Delete")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _shopService.GetByIdAsync(id);
                if (entity == null)
                {
                    return new DataResponse { Status = false, Message = "Dữ liệu không tồn tại." };
                }

                await _shopService.DeleteAsync(entity);
                return new DataResponse { Status = true, Message = "Xóa dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa shop");
                return new DataResponse()
                {
                    Status = false,
                    Message = "Đã xảy ra lỗi khi xóa dữ liệu."
                };
            }
        }
    }
}
