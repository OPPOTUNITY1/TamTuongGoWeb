using TamTuong.Model.Entities;
using TamTuong.Service.Common;
using TamTuong.Service.Common.Service;
using TamTuong.Service.ProductImageService.Dto;
using TamTuong.Service.ProductImageService.Request;

namespace TamTuong.Service.ProductImageService
{
    public interface IProductImageService : IService<ProductImage>
    {
        public Task<PagedList<ProductImageDto>> GetData(ProductImageSearch search);
        public Task<ProductImageDto> GetDto(Guid id);
    }
}
