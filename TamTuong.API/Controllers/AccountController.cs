using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using TamTuong.API.Dto;
using TamTuong.Service.AccountService;
using TamTuong.Service.AccountService.Request;
using TamTuong.Service.Exception;

namespace TamTuong.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly ILogger<AccountController> _logger;
        private readonly IAccountService _accountService;
        public AccountController(ILogger<AccountController> logger, IAccountService accountService)
        {
            _logger = logger;
            _accountService = accountService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDTO request)
        {
            try
            {
                var result = await _accountService.Authenticate(request);
                if (result == null)
                    return Unauthorized(DataResponse.False("Thông tin đăng nhập không hợp lệ"));

                return Ok(DataResponse.Success(result));
            }
            catch (DomainValidationException ex)
            {
                _logger.LogWarning(ex, "Xác thực đăng nhập thất bại");
                return BadRequest(DataResponse.False(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi đăng nhập");
                return StatusCode(500, DataResponse.False("Đã xảy ra lỗi không mong muốn: " + ex.Message));
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                if (request == null)
                    return BadRequest(DataResponse.False("Yêu cầu không được để trống"));

                if (!ModelState.IsValid)
                    return BadRequest(DataResponse.False("Dữ liệu không hợp lệ"));

                await _accountService.RegisterAsync(request);
                return Ok(DataResponse.Success(null, "Đăng ký thành công"));
            }
            catch (DomainValidationException ex)
            {
                _logger.LogWarning(ex, "Xác thực đăng ký thất bại");
                return BadRequest(DataResponse.False(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Đăng ký không thành công");
                return StatusCode(500, DataResponse.False("Đã xảy ra lỗi không mong muốn: " + ex.Message));
            }
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                if (request == null)
                    return BadRequest(DataResponse.False("Yêu cầu không được để trống"));

                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                             ?? User.FindFirst("nameid")?.Value;
                if (string.IsNullOrWhiteSpace(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                    return Unauthorized(DataResponse.False("Không xác thực được người dùng"));

                request.UserId = userId;

                await _accountService.ChangePasswordAsync(request);
                return Ok(DataResponse.Success(null, "Đổi mật khẩu thành công"));
            }
            catch (DomainValidationException ex)
            {
                _logger.LogWarning(ex, "Xác thực đổi mật khẩu thất bại");
                return BadRequest(DataResponse.False(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi đổi mật khẩu");
                return StatusCode(500, DataResponse.False("Đã xảy ra lỗi không mong muốn: " + ex.Message));
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            try
            {
                var token = await _accountService.ForgotPasswordAsync(request);
                return Ok(DataResponse.Success(token, "Đã tạo mã đặt lại mật khẩu"));
            }
            catch (DomainValidationException ex)
            {
                _logger.LogWarning(ex, "Xác thực cập nhật thông tin thất bại");
                return BadRequest(DataResponse.False(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi quên mật khẩu");
                return StatusCode(500, DataResponse.False("Đã xảy ra lỗi không mong muốn: " + ex.Message));
            }
        }


        [Authorize]
        [HttpPost("update-profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            try
            {
                if (request == null)
                    return BadRequest(DataResponse.False("Yêu cầu không được để trống"));

                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                             ?? User.FindFirst("nameid")?.Value;
                if (string.IsNullOrWhiteSpace(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                    return Unauthorized(DataResponse.False("Không xác thực được người dùng"));

                request.UserId = userId;

                await _accountService.UpdateProfileAsync(request);
                return Ok(DataResponse.Success(null, "Cập nhật thông tin thành công"));
            }
            catch (DomainValidationException ex)
            {
                _logger.LogWarning(ex, "Xác thực cập nhật thông tin thất bại");
                return BadRequest(DataResponse.False(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật thông tin");
                return StatusCode(500, DataResponse.False("Đã xảy ra lỗi không mong muốn: " + ex.Message));
            }

        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                await _accountService.ResetPasswordAsync(request);
                return Ok(DataResponse.Success(null, "Đặt lại mật khẩu thành công"));
            }
            catch (DomainValidationException ex)
            {
                _logger.LogWarning(ex, "Xác thực đặt lại mật khẩu thất bại");
                return BadRequest(DataResponse.False(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi đặt lại mật khẩu");
                return StatusCode(500, DataResponse.False("Đã xảy ra lỗi không mong muốn: " + ex.Message));
            }
        }
    }
}

