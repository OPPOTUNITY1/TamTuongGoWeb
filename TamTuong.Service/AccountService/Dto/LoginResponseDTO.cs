using System;
using System.Collections.Generic;
using System.Text;

namespace TamTuong.Service.AccountService.Dto
{
    public class LoginResponseDTO
    {
        public string? Email { get; set; }
        public string? AccessToken { get; set; }
        public int ExpiresIn { get; set; }
        public string? FullName { get; set; }
        public string? ImageUrl { get; set; }
    }
}
