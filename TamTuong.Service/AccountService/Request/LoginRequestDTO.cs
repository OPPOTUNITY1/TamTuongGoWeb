using System;
using System.Collections.Generic;
using System.Text;

namespace TamTuong.Service.AccountService.Request
{
    public class LoginRequestDTO
    {
        public string? Username { get; set; }
        public string? Password { get; set; }
    }
}
