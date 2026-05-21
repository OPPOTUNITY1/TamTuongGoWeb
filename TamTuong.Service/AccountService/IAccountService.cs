using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Service.AccountService.Dto;
using TamTuong.Service.AccountService.Request;
using TamTuong.Service.Common.Service;

namespace TamTuong.Service.AccountService
{
    public interface IAccountService 
    {
        Task<LoginResponseDTO?> Authenticate(LoginRequestDTO request);

        Task ChangePasswordAsync(ChangePasswordRequest request);

        Task<string> ForgotPasswordAsync(ForgotPasswordRequest request);

        Task ResetPasswordAsync(ResetPasswordRequest request);

        Task RegisterAsync(RegisterRequest request);

        Task UpdateProfileAsync(UpdateProfileRequest request);
    }
}
