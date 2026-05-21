using System;
using System.Collections.Generic;
using TamTuong.Model.Entities;
using TamTuong.Service.Common.Service;
using TamTuong.Service.SellerService.Dto;
using TamTuong.Service.SellerService.Request;

namespace TamTuong.Service.SellerService
{
    public interface ISellerService : IService<Seller>
    {
        Task<List<SellerDto>> GetData(SellerSearchDto search);
        Task<SellerDto> GetDto(Guid id);
        Task<bool> IsSellerExistByUser(Guid userId, Guid? excludeId = null);
    }
}
