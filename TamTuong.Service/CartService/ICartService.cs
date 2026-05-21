using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Service.CartService.Dto;
using TamTuong.Service.CartService.Request;
using TamTuong.Service.Common;
using TamTuong.Service.Common.Dto;
using TamTuong.Service.Common.Service;

namespace TamTuong.Service.CartService
{
    public interface ICartService : IService<Cart>
    {
        public Task<PagedList<CartDto>> Getdata(CartSearch search);
        public Task<CartDto> GetDto(Guid id);
        public Task<CartDto> RemoveCart(Guid id);
        // Remove all cart entries that reference the productId (hard delete)
        public Task<int> RemoveByProductIdAsync(Guid productId);
    }
}
