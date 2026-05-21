using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TamTuong.API.Dto;
using TamTuong.Model.Entities;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.CategoryService;
using TamTuong.Service.CategoryService.Dto;
using TamTuong.Service.CategoryService.Request;

namespace TamTuong.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : Controller
    {
        private readonly ILogger<CategoryController> _logger;
        private readonly ICategoryService _categoryService;
        private readonly Mapper _mapper;

        public CategoryController(ILogger<CategoryController> logger, ICategoryService categoryService, Mapper mapper)
        {
            _logger = logger;
            _categoryService = categoryService;
            _mapper = mapper;
        }

        [Authorize(Roles = "Seller")]
        [HttpPost("Create")]
        public async Task<DataResponse<CategoryDto>> Create(CategoryRequestDto request)
        {
            try
            {
                if (await _categoryService.IsCategoryNameExist(request.ShopId, request.CategoryName))
                {
                    return new DataResponse<CategoryDto>
                    {
                        Data = null,
                        Status = false,
                        Message = "Tên danh mục đã tồn tại."
                    };
                }
                var entity = _mapper.Map<CategoryRequestDto, Category>(request);
                await _categoryService.CreateAsync(entity);
                var data = _mapper.Map<Category, CategoryDto>(entity);
                return new DataResponse<CategoryDto> { Data = data, Status = true, Message = "Tạo dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo category");
                return new DataResponse<CategoryDto>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi tạo dữ liệu."
                };
            }
        }

        [Authorize(Roles = "Seller")]
        [HttpPut("Update")]
        public async Task<DataResponse<CategoryDto>> Update(CategoryRequestDto request)
        {
            try
            {
                if (await _categoryService.IsCategoryNameExist(request.ShopId, request.CategoryName, request.Id))
                {
                    return new DataResponse<CategoryDto>
                    {
                        Data = null,
                        Status = false,
                        Message = "Tên danh mục đã tồn tại."
                    };
                }

                var existing = await _categoryService.GetByIdAsync(request.Id);
                if (existing == null)
                    return new DataResponse<CategoryDto> { Data = null, Status = false, Message = "Danh mục không tồn tại." };

                // Update only the editable fields — preserves audit fields
                existing.CategoryName = request.CategoryName;
                existing.ShopId = request.ShopId == Guid.Empty ? existing.ShopId : request.ShopId;
                existing.SellersId = request.SellersId ?? existing.SellersId;
                existing.ParentCategoryId = request.ParentCategoryId;

                await _categoryService.SaveAsync();

                var data = _mapper.Map<Category, CategoryDto>(existing);
                return new DataResponse<CategoryDto> { Data = data, Status = true, Message = "Cập nhật dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật category");
                return new DataResponse<CategoryDto>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi cập nhật dữ liệu."
                };
            }
        }

        [HttpPost("GetData")]
        public async Task<DataResponse<List<CategoryDto>>> GetData([FromBody] CategorySearchDto search)
        {
            try
            {
                var data = await _categoryService.GetData(search ?? new CategorySearchDto());
                return new DataResponse<List<CategoryDto>> { Data = data, Status = true, Message = "Tìm kiếm dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tìm kiếm category");
                return new DataResponse<List<CategoryDto>>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi tìm kiếm dữ liệu."
                };
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<CategoryDto>> Get(Guid id)
        {
            try
            {
                var data = await _categoryService.GetDto(id);
                return new DataResponse<CategoryDto> { Data = data, Status = true, Message = "Tìm kiếm dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tìm kiếm category");
                return new DataResponse<CategoryDto>()
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
                var entity = await _categoryService.GetByIdAsync(id);
                if (entity == null)
                {
                    return new DataResponse { Status = false, Message = "Dữ liệu không tồn tại." };
                }

                await _categoryService.DeleteAsync(entity);
                return new DataResponse { Status = true, Message = "Xóa dữ liệu thành công." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa category");
                return new DataResponse()
                {
                    Status = false,
                    Message = "Đã xảy ra lỗi khi xóa dữ liệu."
                };
            }
        }
    }
}
