using MongoDB.Driver.Linq;
using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Repository.Common;
using TamTuong.Repository.ProductImageRepository;
using TamTuong.Service.Common;
using TamTuong.Service.Common.Service;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.ProductImageService.Dto;
using TamTuong.Service.ProductImageService.Request;

namespace TamTuong.Service.ProductImageService
{
    public class ProductImageService : Service<ProductImage>, IProductImageService
    {
        private readonly IProductImageRepository _productImageRepository;
        private readonly Mapper _mapper;
        public ProductImageService(IRepository<ProductImage> repository, IProductImageRepository productImageRepository,Mapper mapper) : base(repository)
        {
            _productImageRepository = productImageRepository;
            _mapper = mapper;

        }

        public async Task<PagedList<ProductImageDto>> GetData(ProductImageSearch search)
        {
            try
            {
                var query = _productImageRepository.GetQueryable().Where(x => !x.IsDeleted);
                if (search.ProductId != null)
                {
                    query = query.Where(x => x.ProductId == search.ProductId);
                }

                return await PagedList<ProductImageDto>.CreateAsync(query.Select(x => _mapper.Map<ProductImage, ProductImageDto>(x)), search);
            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);

            }
        }

        public async Task<ProductImageDto> GetDto(Guid id)
        {
            try
            {
                var query = await _productImageRepository.GetQueryable().Where(x => !x.IsDeleted && x.Id == id).FirstOrDefaultAsync();
                if (query == null)
                {
                    throw new System.Exception("Không tìm thấy dữ liệu");
                }
                return _mapper.Map<ProductImage, ProductImageDto>(query);

            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }
    }
}
