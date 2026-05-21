using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TamTuong.API.Dto;
using TamTuong.Model.Entities;
using TamTuong.Service.Common;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.ProductImageService;
using TamTuong.Service.ProductImageService.Dto;
using TamTuong.Service.ProductImageService.Request;
using TamTuong.Service.ProductService;

namespace TamTuong.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductImageController : Controller
    {
        private readonly ILogger<ProductImageController> _logger;
        private readonly IProductImageService _productImageService;
        private readonly Mapper _mapper;
        public ProductImageController(ILogger<ProductImageController> logger, IProductImageService productImageService, Mapper mapper)
        {
            _logger = logger;
            _productImageService = productImageService;
            _mapper = mapper;
        }
        [Authorize(Roles = "Seller")]
        [HttpPost("Create")]
        public async Task<DataResponse<ProductImageDto>> Create(ProductImageRequest request)
        {
            try
            {
                var entity = _mapper.Map<ProductImageRequest, ProductImage>(request);
                await _productImageService.CreateAsync(entity);
                var data = _mapper.Map<ProductImage, ProductImageDto>(entity);
                return new DataResponse<ProductImageDto> { Data = data, Status = true, Message = "Tạo dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo rà soát");
                return new DataResponse<ProductImageDto>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi tạo dữ liệu."
                };
            }
        }
        [Authorize(Roles = "Seller")]
        [HttpPut("Update")]
        public async Task<DataResponse<ProductImageDto>> Update(ProductImageRequest request)
        {
            try
            {
                var entity = await _productImageService.GetByIdAsync(request.Id);
                if (entity == null)
                {
                    return new DataResponse<ProductImageDto> { Data = null, Status = false, Message = "Không tìm thấy dữ liệu." };
                }
                entity = _mapper.Map<ProductImageRequest, ProductImage>(request);
                await _productImageService.UpdateAsync(entity);
                var data = _mapper.Map<ProductImage, ProductImageDto>(entity);
                return new DataResponse<ProductImageDto> { Data = data, Status = true, Message = "Cập nhật dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật rà soát");
                return new DataResponse<ProductImageDto>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi cập nhật dữ liệu."
                };
            }
        }
        [Authorize(Roles = "Seller")]
        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse<bool>> Delete(Guid id)
        {
            try
            {
                var entity = await _productImageService.GetByIdAsync(id);
                if (entity == null)
                {
                    return new DataResponse<bool> { Data = false, Status = false, Message = "Không tìm thấy dữ liệu." };
                }
                await _productImageService.DeleteAsync(entity);
                return new DataResponse<bool> { Data = true, Status = true, Message = "Xóa dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa rà soát");
                return new DataResponse<bool>()
                {
                    Data = false,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi xóa dữ liệu."
                };
            }
        }
        [HttpPost("GetData")]
        public async Task<DataResponse<PagedList<ProductImageDto>>> GetData(ProductImageSearch search)
        {
            try
            {
                var data = await _productImageService.GetData(search);
                return new DataResponse<PagedList<ProductImageDto>> { Data = data, Status = true, Message = "Lấy dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy dữ liệu rà soát");
                return new DataResponse<PagedList<ProductImageDto>>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi lấy dữ liệu."
                };
            }
        }
        [HttpGet("Get/{id}")]
        public async Task<DataResponse<ProductImageDto>> Get(Guid id)
        {
            try
            {
                var data = await _productImageService.GetDto(id);
                return new DataResponse<ProductImageDto> { Data = data, Status = true, Message = "Lấy dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy dữ liệu rà soát");
                return new DataResponse<ProductImageDto>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi lấy dữ liệu."
                };
            }
        }
    }
}