using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TamTuong.API.Dto;
using TamTuong.Model.Entities;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.SellerService;
using TamTuong.Service.SellerService.Dto;
using TamTuong.Service.SellerService.Request;

namespace TamTuong.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SellerController : Controller
    {
        private readonly ILogger<SellerController> _logger;
        private readonly ISellerService _sellerService;
        private readonly Mapper _mapper;

        public SellerController(ILogger<SellerController> logger, ISellerService sellerService, Mapper mapper)
        {
            _logger = logger;
            _sellerService = sellerService;
            _mapper = mapper;
        }

        // Only users in role Seller can create a Seller
        [HttpPost("Create")]
        [Authorize(Roles = "Seller")]
        public async Task<DataResponse<SellerDto>> Create(SellerRequestDto request)
        {
            try
            {
                // If not provided, try to get user id from token
                // JwtSecurityTokenHandler may not map short claim names on some versions
                var userId = request.UserId;
                if (userId == Guid.Empty)
                {
                    var uid = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                           ?? User?.FindFirst("nameid")?.Value
                           ?? User?.FindFirst("sub")?.Value;
                    if (!Guid.TryParse(uid, out var parsed))
                    {
                        return new DataResponse<SellerDto> { Data = null, Status = false, Message = "Không xác định được UserId." };
                    }
                    userId = parsed;
                }

                if (await _sellerService.IsSellerExistByUser(userId))
                {
                    return new DataResponse<SellerDto> { Data = null, Status = false, Message = "Người dùng đã có Seller." };
                }

                request.UserId = userId;
                var entity = _mapper.Map<SellerRequestDto, Seller>(request);
                await _sellerService.CreateAsync(entity);
                var data = _mapper.Map<Seller, SellerDto>(entity);
                return new DataResponse<SellerDto> { Data = data, Status = true, Message = "Tạo Seller thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo seller");
                return new DataResponse<SellerDto>() { Data = null, Status = false, Message = "Đã xảy ra lỗi khi tạo Seller." };
            }
        }

        [HttpPut("Update")]
        [Authorize(Roles = "Seller")]
        public async Task<DataResponse<SellerDto>> Update(SellerRequestDto request)
        {
            try
            {
                if (request.Id == null || request.Id == Guid.Empty)
                    return new DataResponse<SellerDto> { Data = null, Status = false, Message = "Id không hợp lệ." };

                var entity = await _sellerService.GetByIdAsync(request.Id.Value);
                if (entity == null)
                    return new DataResponse<SellerDto> { Data = null, Status = false, Message = "Không tìm thấy Seller." };

                entity.BusinessName = request.BusinessName;
                entity.TaxCode = request.TaxCode;

                await _sellerService.UpdateAsync(entity);
                var data = _mapper.Map<Seller, SellerDto>(entity);
                return new DataResponse<SellerDto> { Data = data, Status = true, Message = "Cập nhật Seller thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật seller");
                return new DataResponse<SellerDto>() { Data = null, Status = false, Message = "Đã xảy ra lỗi khi cập nhật Seller." };
            }
        }

        [HttpPost("GetData")]
        public async Task<DataResponse<List<SellerDto>>> GetData([FromBody] SellerSearchDto search)
        {
            try
            {
                var data = await _sellerService.GetData(search ?? new SellerSearchDto());
                return new DataResponse<List<SellerDto>> { Data = data, Status = true, Message = "Tìm kiếm dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tìm kiếm seller");
                return new DataResponse<List<SellerDto>>() { Data = null, Status = false, Message = "Đã xảy ra lỗi khi tìm kiếm dữ liệu." };
            }
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<DataResponse<SellerDto>> GetMySeller()
        {
            try
            {
                // JwtSecurityTokenHandler may not map short claim names on some versions,
                // try ClaimTypes.NameIdentifier (full URI) then "nameid" (short form) as fallback
                var uid = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? User?.FindFirst("nameid")?.Value
                       ?? User?.FindFirst("sub")?.Value;

                if (!Guid.TryParse(uid, out var userId))
                    return new DataResponse<SellerDto> { Data = null, Status = false, Message = "Không xác định được người dùng." };

                var search = new SellerSearchDto { UserId = userId };
                var list = await _sellerService.GetData(search);
                var seller = list?.FirstOrDefault();
                if (seller == null)
                    return new DataResponse<SellerDto> { Data = null, Status = false, Message = "Chưa có hồ sơ Seller." };
                return new DataResponse<SellerDto> { Data = seller, Status = true, Message = "Tìm kiếm dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy seller của người dùng");
                return new DataResponse<SellerDto>() { Data = null, Status = false, Message = "Đã xảy ra lỗi." };
            }
        }


        [HttpGet("Get/{id}")]
        public async Task<DataResponse<SellerDto>> Get(Guid id)
        {
            try
            {
                var data = await _sellerService.GetDto(id);
                return new DataResponse<SellerDto> { Data = data, Status = true, Message = "Tìm kiếm dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tìm kiếm seller");
                return new DataResponse<SellerDto>() { Data = null, Status = false, Message = "Đã xảy ra lỗi khi tìm kiếm dữ liệu." };
            }
        }

        [HttpDelete("Delete")]
        [Authorize(Roles = "Seller")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _sellerService.GetByIdAsync(id);
                if (entity == null)
                {
                    return new DataResponse { Status = false, Message = "Dữ liệu không tồn tại." };
                }

                await _sellerService.DeleteAsync(entity);
                return new DataResponse { Status = true, Message = "Xóa dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa seller");
                return new DataResponse() { Status = false, Message = "Đã xảy ra lỗi khi xóa dữ liệu." };
            }
        }
    }
}
