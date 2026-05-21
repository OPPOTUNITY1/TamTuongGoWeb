using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Service.Common;
using TamTuong.Service.Common.Service;
using TamTuong.Service.ProductService.Dto;
using TamTuong.Service.ProductService.Request;

namespace TamTuong.Service.ProductService
{
    public interface IProductService : IService<Product>
    {
        public Task<bool> IsProductNameExist(Guid shopId,
        string productName,
        Guid? excludeId = null);
        public Task<List<ProductDto>> GetProductByShop(Guid shopId);
        public Task<PagedList<ProductDto>> GetData(ProductSearchDto search);
        public Task<ProductDto> GetDto(Guid id);
        // Create a product and its associated images in one operation
        public Task<ProductDto> CreateProductAsync(ProductRequestDto request);
        public Task<ProductDto> UpdateProductAsync(ProductRequestDto request);
    }
}
