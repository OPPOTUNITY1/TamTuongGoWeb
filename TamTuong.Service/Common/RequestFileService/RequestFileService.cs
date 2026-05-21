using System;
using System.Collections.Generic;
using System.Text;

namespace TamTuong.Service.Common.RequestFileService
{
    public class RequestFileService : IRequestFileService
    {
        //private readonly IDistributedCache _cache;

        public RequestFileService(
            //IDistributedCache cache
            )
        {
            //_cache = cache;
        }

        public Task<string?> AccessFile(string? guid)
        {
            throw new NotImplementedException();
        }

        public Task<string> RequestFile(string? path)
        {
            throw new NotImplementedException();
        }

        //public async Task<string?> AccessFile(string? guid)
        //    => await _cache.GetStringAsync(guid);


        //public async Task<string> RequestFile(string? path)
        //{
        //    var guid = Guid.NewGuid().ToString();
        //    await _cache.SetStringAsync(guid, path, new DistributedCacheEntryOptions()
        //    {
        //        AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(AppSettings.SecondsRequestFile)
        //    });
        //    return guid;
        //}
    }
}