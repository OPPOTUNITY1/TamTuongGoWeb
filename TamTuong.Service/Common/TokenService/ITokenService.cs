using System;
using System.Collections.Generic;
using System.Text;

namespace TamTuong.Service.Common.TokenService
{
    public interface ITokenService
    {
        Task<bool> IsCurrentActiveToken();
        Task DeactivateCurrentToken();
        Task<bool> IsActiveAsync(string token);
        Task DeactivateAsync(string token);
        Task<string?> GenerateQrLogin(string guid, string userId);
        Task<string?> GetQrLogin(string guid);

    }
}
