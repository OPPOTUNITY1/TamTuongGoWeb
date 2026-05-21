using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TamTuong.API.Dto;
using TamTuong.Model.Entities;
using TamTuong.Repository.Common;
using TamTuong.Service.Common;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.ProductService;
using TamTuong.Service.ProductService.Dto;
using TamTuong.Service.ProductService.Request;

namespace TamTuong.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : Controller
    {
        private readonly ILogger<ProductController> _logger;
        private readonly IProductService _productService;
        private readonly Mapper _mapper;
        private readonly IRepository<ProductImage> _productImageRepository;
        private readonly TamTuong.Service.CartService.ICartService _cartService;

        public ProductController(ILogger<ProductController> logger, IProductService productService, Mapper mapper, IRepository<ProductImage> productImageRepository, TamTuong.Service.CartService.ICartService cartService)
        {
            _logger = logger;
            _productService = productService;
            _mapper = mapper;
            _productImageRepository = productImageRepository;
            _cartService = cartService;
        }

        [Authorize(Roles = "Seller")]
        [HttpPost("Create")]
        public async Task<DataResponse<ProductDto>> Create(ProductRequestDto request)
        {
            try
            {
                if(await _productService.IsProductNameExist(request.ShopId ,request.ProductName))
                {
                    return new DataResponse<ProductDto> { Data = null, Status = false, Message = "Tên sản phẩm đã tồn tại." };
                }
                var data = await _productService.CreateProductAsync(request);
                return new DataResponse<ProductDto> { Data = data, Status = true, Message = "Tạo dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo product");
                return new DataResponse<ProductDto>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi tạo dữ liệu."
                };
            }
        }

        [Authorize(Roles = "Seller")]
        [HttpPut("Update")]
        public async Task<DataResponse<ProductDto>> Update(ProductRequestDto request)
        {
            try
            {
                if (await _productService.IsProductNameExist(request.ShopId, request.ProductName, request.Id))
                {
                    return new DataResponse<ProductDto> { Data = null, Status = false, Message = "Tên sản phẩm đã tồn tại." };
                }

                var updated = await _productService.UpdateProductAsync(request);
                return new DataResponse<ProductDto> { Data = updated, Status = true, Message = "Cập nhật dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật product");
                return new DataResponse<ProductDto>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi cập nhật dữ liệu."
                };
            }
        }

        [HttpPost("GetData")]
        public async Task<DataResponse<PagedList<ProductDto>>> GetData([FromBody] ProductSearchDto search)
        {
            try
            {
                var data = await _productService.GetData(search ?? new ProductSearchDto());
                return new DataResponse<PagedList<ProductDto>> { Data = data, Status = true, Message = "Tìm kiếm dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tìm kiếm product");
                return new DataResponse<PagedList<ProductDto>>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi tìm kiếm dữ liệu."
                };
            }
        }

        [HttpGet("GetByShop/{shopId}")]
        public async Task<DataResponse<List<ProductDto>>> GetByShop(Guid shopId)
        {
            try
            {
                var data = await _productService.GetProductByShop(shopId);
                return new DataResponse<List<ProductDto>> { Data = data, Status = true, Message = "Lấy dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy product theo cửa hàng");
                return new DataResponse<List<ProductDto>>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi lấy dữ liệu."
                };
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<ProductDto>> Get(Guid id)
        {
            try
            {
                var data = await _productService.GetDto(id);
                return new DataResponse<ProductDto> { Data = data, Status = true, Message = "Tìm kiếm dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tìm kiếm product");
                return new DataResponse<ProductDto>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi tìm kiếm dữ liệu."
                };
            }
        }

        [Authorize(Roles = "Seller")]
        [HttpDelete("Delete")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _productService.GetByIdAsync(id);
                if (entity == null)
                {
                    return new DataResponse { Status = false, Message = "Dữ liệu không tồn tại." };
                }

                await _productService.DeleteAsync(entity);
                return new DataResponse { Status = true, Message = "Xóa dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa product");
                return new DataResponse()
                {
                    Status = false,
                    Message = "Đã xảy ra lỗi khi xóa dữ liệu."
                };
            }
        }

        [HttpGet("IsProductNameExist")]
        public async Task<DataResponse<bool>> IsProductNameExist(Guid shopId, string productName, Guid? excludeId = null)
        {
            try
            {
                var exists = await _productService.IsProductNameExist(shopId, productName, excludeId);
                return new DataResponse<bool> { Data = exists, Status = true, Message = "Kiểm tra tên sản phẩm." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi kiểm tra tên sản phẩm");
                return new DataResponse<bool>()
                {
                    Data = false,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi kiểm tra tên sản phẩm."
                };
            }
        }
    }
}
