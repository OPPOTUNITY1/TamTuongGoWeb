using System;
using System.Collections.Generic;
using TamTuong.Model.Entities;
using TamTuong.Service.Common;
using TamTuong.Service.Common.Service;
using TamTuong.Service.ShopService.Dto;
using TamTuong.Service.ShopService.Request;

namespace TamTuong.Service.ShopService
{
    public interface IShopService : IService<Shop>
    {
        Task<PagedList<ShopDto>> GetData(ShopSearchDto search);
        Task<ShopDto> GetDto(Guid id);
        Task<List<ShopDto>> GetShopBySeller(Guid sellerId);
        Task<bool> IsShopNameExist(Guid sellerId, string name, Guid? excludeId = null);
    }
}
