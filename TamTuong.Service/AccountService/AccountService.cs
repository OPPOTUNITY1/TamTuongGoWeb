using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Identity;
using TamTuong.Service.AccountService.Request;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using TamTuong.Model;
using TamTuong.Model.Entities;
using System.Linq;
using TamTuong.Service.AccountService.Dto;
using TamTuong.Service.Exception;

namespace TamTuong.Service.AccountService
{
    public class AccountService : IAccountService
    {
        private readonly TamTuongContext db;
        private readonly IConfiguration config;
        private readonly RoleManager<Role> _roleManager;
        private readonly UserManager<User> _userManager;
        private readonly IPasswordHasher<User> _passwordHasher;

        public AccountService(TamTuongContext db, IConfiguration config, UserManager<User> userManager, RoleManager<Role> roleManager, IPasswordHasher<User> passwordHasher)
        {
            this.db = db;
            this.config = config;
            _userManager = userManager;
            _roleManager = roleManager;
            _passwordHasher = passwordHasher;
        }

        public async Task UpdateProfileAsync(UpdateProfileRequest request)
        {
            if (request.UserId == Guid.Empty)
                throw new DomainValidationException("Người dùng không hợp lệ");

            var user = await _userManager.FindByIdAsync(request.UserId.ToString());
            if (user == null)
                throw new DomainValidationException("Người dùng không tồn tại");

            // update fields if provided
            if (!string.IsNullOrWhiteSpace(request.FullName))
                user.FullName = request.FullName.Trim();
            if (!string.IsNullOrWhiteSpace(request.ImageUrl))
                user.ImageUrl = request.ImageUrl.Trim();
            if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
                user.PhoneNumber = request.PhoneNumber.Trim();

            // Email update: use SetEmailAsync to handle NormalizedEmail correctly
            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                var newEmail = request.Email.Trim();
                if (!string.Equals(user.Email, newEmail, StringComparison.OrdinalIgnoreCase))
                {
                    var setEmailResult = await _userManager.SetEmailAsync(user, newEmail);
                    if (!setEmailResult.Succeeded)
                    {
                        var err = string.Join("; ", setEmailResult.Errors.Select(e => e.Description));
                        throw new DomainValidationException(err);
                    }
                }
            }

            var res = await _userManager.UpdateAsync(user);
            if (!res.Succeeded)
            {
                var err = string.Join("; ", res.Errors.Select(e => e.Description));
                throw new DomainValidationException(err);
            }
        }

        public async Task<LoginResponseDTO?> Authenticate(LoginRequestDTO request)
        {

            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
                return null;

            var normalized = request.Username.Trim().ToLower();
            var user = await db.Users.FirstOrDefaultAsync(u =>
                (u.Email != null && u.Email.ToLower() == normalized) ||
                (u.UserName != null && u.UserName.ToLower() == normalized));

            if (user == null)
                throw new LoginValidationException($"Người dùng với tài khoản {request.Username} không tồn tại!");

            // verify password using ASP.NET Identity
            var isValidPassword = await _userManager.CheckPasswordAsync(user, request.Password);
            if (!isValidPassword)
                throw new LoginValidationException("Mật khẩu không đúng");

            // get user's role name (if any)
            string? roleName = null;
            var userRole = await db.Set<IdentityUserRole<Guid>>().FirstOrDefaultAsync(ur => ur.UserId == user.Id);
            if (userRole != null)
            {
                var role = await db.Roles.FindAsync(userRole.RoleId);
                roleName = role?.Name;
            }

            var issuer = config["JwtConfig:Issuer"];
            var audience = config["JwtConfig:Audience"];
            var key = config["JwtConfig:Key"];
            var tokenValidityMins = config.GetValue<int?>("JwtConfig:TokenValidityInMinutes")
                                    ?? config.GetValue<int?>("JwtConfig:ToKenValidityMins")
                                    ?? 60;
            var tokenExpiryTimeStamp = DateTime.UtcNow.AddMinutes(tokenValidityMins);


            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(JwtRegisteredClaimNames.UniqueName, request.Username),
                    string.IsNullOrEmpty(roleName) ? null : new Claim("role", roleName),
                    new Claim("nameid", user.Id.ToString()),
                }.Where(c => c != null).Cast<Claim>()),
                Expires = tokenExpiryTimeStamp,
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(key)), SecurityAlgorithms.HmacSha256Signature),
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var securityToken = tokenHandler.CreateToken(tokenDescriptor);
            var accessToken = tokenHandler.WriteToken(securityToken);
            return new LoginResponseDTO
            {
                AccessToken = accessToken,
                Email = request.Username,
                ExpiresIn = (int)tokenExpiryTimeStamp.Subtract(DateTime.UtcNow).TotalSeconds,
                FullName = user.FullName,
                ImageUrl = user.ImageUrl,
            };
        }

        public async Task RegisterAsync(RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Password))
                throw new DomainValidationException("Mật khẩu là bắt buộc");

            if (request.Password.Length < 6)
                throw new DomainValidationException("Mật khẩu phải có ít nhất 6 ký tự");

            if (string.IsNullOrWhiteSpace(request.UserName))
                throw new DomainValidationException("Tài khoản là bắt buộc");

            var account = request.UserName.Trim();
            if (account.Contains("@"))
                throw new DomainValidationException("Vui lòng đăng ký bằng username, không dùng email");

            var normalizedUsername = account.ToLower();
            var existing = await db.Users.FirstOrDefaultAsync(u => u.UserName != null && u.UserName.ToLower() == normalizedUsername);
            if (existing != null)
                throw new DomainValidationException("Người dùng đã tồn tại");

            var user = new User
            {
                Email = null,
                UserName = account,
                EmailConfirmed = true
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                var err = string.Join("; ", result.Errors.Select(e => e.Description));
                throw new DomainValidationException(err);
            }
            await _userManager.AddToRoleAsync(user, "Customer");
        }

        public async Task ChangePasswordAsync(ChangePasswordRequest request)
        {
            if (request.UserId == Guid.Empty || string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
                throw new DomainValidationException("Dữ liệu không hợp lệ");

            var user = await _userManager.FindByIdAsync(request.UserId.ToString());
            if (user == null)
                throw new DomainValidationException("Người dùng không tồn tại");

            var changeRes = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
            if (!changeRes.Succeeded)
            {
                var err = string.Join("; ", changeRes.Errors.Select(e => e.Description));
                throw new DomainValidationException(err);
            }
        }

        public async Task<string> ForgotPasswordAsync(ForgotPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                throw new DomainValidationException("Email không được để trống");

            var normalized = request.Email.Trim().ToLower();
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalized);
            if (user == null)
                throw new DomainValidationException("Người dùng không tồn tại");

            // create a simple token (in real world use proper token provider)
            var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray());

            // store token in EmailLog for demo purposes
            db.EmailLogs.Add(new EmailLog
            {
                ToEmail = user.Email,
                Subject = "Password reset token",
                Body = token,
                SentAt = DateTime.Now,
                Status = "PENDING"
            });
            await db.SaveChangesAsync();

            return token;
        }

        public async Task ResetPasswordAsync(ResetPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.NewPassword))
                throw new DomainValidationException("Dữ liệu không hợp lệ");

            var normalized = request.Email.Trim().ToLower();
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalized);
            if (user == null)
                throw new DomainValidationException("Người dùng không tồn tại");

            // validate token against EmailLog (simple approach)
            var log = await db.EmailLogs.FirstOrDefaultAsync(e => e.ToEmail == user.Email && e.Body == request.Token);
            if (log == null)
                throw new DomainValidationException("Token không hợp lệ");

            // update password using Identity's password hasher to keep consistency
            user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);
            var updateRes = await _userManager.UpdateAsync(user);
            if (!updateRes.Succeeded)
            {
                var err = string.Join("; ", updateRes.Errors.Select(e => e.Description));
                throw new DomainValidationException(err);
            }
            log.Status = "USED";
            await db.SaveChangesAsync();
        }
    }
}

