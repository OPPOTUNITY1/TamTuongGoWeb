using Microsoft.AspNetCore.Mvc;
using TamTuong.API.Dto;
using TamTuong.Model.Entities;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.UserInformationService;
using TamTuong.Service.UserInformationService.Dto;
using TamTuong.Service.UserInformationService.Request;

namespace TamTuong.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserInformationController : Controller
    {
        private readonly ILogger<UserInformationController> _logger;
        private readonly IUserInformationService _userInformationService;
        private readonly Mapper _mapper;
        public UserInformationController(ILogger<UserInformationController> logger, IUserInformationService userInformationService, Mapper mapper)
        {
            _logger = logger;
            _userInformationService = userInformationService;
            _mapper = mapper;
        }
        [HttpPost("Create")]
        public async Task<DataResponse<UserInformationDto>> Create(UserInformationRequestDto request)
        {
            try
            {
                var entity = _mapper.Map<UserInformationRequestDto, UserInformation>(request);
                await _userInformationService.CreateAsync(entity);
                var data = _mapper.Map<UserInformation, UserInformationDto>(entity);
                return new DataResponse<UserInformationDto> { Data = data, Status = true, Message = "Tạo dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo rà soát");
                return new DataResponse<UserInformationDto>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi tạo dữ liệu."
                };
            }
        }
        [HttpPut("Update")]
        public async Task<DataResponse<UserInformationDto>> Update(UserInformationRequestDto request)
        {
            try
            {
                if (!request.Id.HasValue)
                    return new DataResponse<UserInformationDto> { Status = false, Message = "Id không hợp lệ." };

                var entity = await _userInformationService.GetByIdAsync(request.Id);
                if (entity == null)
                    return new DataResponse<UserInformationDto> { Status = false, Message = "Không tìm thấy địa chỉ." };

                entity.FullName = request.FullName;
                entity.Email = request.Email;
                entity.PhoneNumber = request.PhoneNumber;
                entity.StreetAddress = request.StreetAddress;
                entity.BuildingInfo = request.BuildingInfo;
                entity.District = request.District;
                entity.Ward = request.Ward;
                entity.City = request.City;

                await _userInformationService.UpdateAsync(entity);
                var data = _mapper.Map<UserInformation, UserInformationDto>(entity);
                return new DataResponse<UserInformationDto> { Data = data, Status = true, Message = "Cập nhật dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật địa chỉ");
                return new DataResponse<UserInformationDto>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi cập nhật dữ liệu."
                };
            }
        }
        [HttpPost("GetData")]
        public async Task<DataResponse<List<UserInformationDto>>> GetData([FromBody] UserInformationSearchDto searchDto)
        {
            try
            {
                var data = await _userInformationService.GetData(searchDto);
                return new DataResponse<List<UserInformationDto>> { Data = data, Status = true, Message = "Tìm kiếm dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tìm kiếm rà soát");
                return new DataResponse<List<UserInformationDto>>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi tìm kiếm dữ liệu."
                };
            }
        }
        [HttpGet("Get/{id}")]
        public async Task<DataResponse<UserInformationDto>> Get(Guid id)
        {
            try
            {
                var data = await _userInformationService.GetDto(id);
                return new DataResponse<UserInformationDto> { Data = data, Status = true, Message = "Tìm kiếm dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tìm kiếm rà soát");
                return new DataResponse<UserInformationDto>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi tìm kiếm dữ liệu."
                };
            }
        }
        [HttpDelete("Delete")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _userInformationService.GetByIdAsync(id);
                if (entity == null)
                {
                    return new DataResponse { Status = false, Message = "Dữ liệu không tồn tại." };
                }

                await _userInformationService.DeleteAsync(entity);
                return new DataResponse { Status = true, Message = "Xóa dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa rà soát");
                return new DataResponse()
                {
                    Status = false,
                    Message = "Đã xảy ra lỗi khi xóa dữ liệu."
                };
            }
        }
    }
}
