using System;

namespace TamTuong.Service.AccountService.Request
{
    public class RegisterRequest
    {
        public string? UserName { get; set; }
        public string? Password { get; set; }
        public string? RoleName { get; set; }
    }
}
