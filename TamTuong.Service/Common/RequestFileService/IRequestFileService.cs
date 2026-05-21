using System;
using System.Collections.Generic;
using System.Text;

namespace TamTuong.Service.Common.RequestFileService
{
    public interface IRequestFileService
    {
        Task<string> RequestFile(string? path);
        Task<string?> AccessFile(string? guid);

    }
}

