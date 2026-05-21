using System;
using System.Collections.Generic;
using TamTuong.Model.Entities;
using TamTuong.Service.Common.Service;
using TamTuong.Service.CategoryService.Dto;
using TamTuong.Service.CategoryService.Request;

namespace TamTuong.Service.CategoryService
{
    public interface ICategoryService : IService<Category>
    {
        Task<List<CategoryDto>> GetData(CategorySearchDto search);
        Task<CategoryDto> GetDto(Guid id);
        Task<bool> IsCategoryNameExist(Guid shopeId, string name, Guid? excludeId = null);
    }
}
