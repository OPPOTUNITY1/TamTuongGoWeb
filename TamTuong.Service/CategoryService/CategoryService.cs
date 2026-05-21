using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TamTuong.Model.Entities;
using TamTuong.Repository.CategoryRepository;
using TamTuong.Repository.Common;
using TamTuong.Service.Common.Service;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.CategoryService.Dto;
using TamTuong.Service.CategoryService.Request;

namespace TamTuong.Service.CategoryService
{
    public class CategoryService : Service<Category>, ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly Mapper _mapper;

        public CategoryService(IRepository<Category> repository, ICategoryRepository categoryRepository, Mapper mapper) : base(repository)
        {
            _categoryRepository = categoryRepository;
            _mapper = mapper;
        }

        public async Task<List<CategoryDto>> GetData(CategorySearchDto search)
        {
            try
            {
                var query = _categoryRepository.GetQueryable().AsNoTracking();

                if (search != null)
                {
                    if (search.Id.HasValue && search.Id.Value != Guid.Empty)
                    {
                        query = query.Where(x => x.Id == search.Id.Value);
                    }
                    if (search.ShopId.HasValue && search.ShopId.Value != Guid.Empty)
                    {
                        query = query.Where(x => x.ShopId == search.ShopId.Value);
                    }
                    if (!string.IsNullOrWhiteSpace(search.CategoryName))
                    {
                        query = query.Where(x => x.CategoryName != null && x.CategoryName.Contains(search.CategoryName));
                    }
                }

                query = query.OrderByDescending(x => x.CreatedDate).Where(x => !x.IsDeleted);
                var data = await query.ToListAsync();
                var dtoList = _mapper.MapToList<Category, CategoryDto>(data);

                // Populate CategoryParentName for each DTO by loading parent categories in a single query
                var parentIds = dtoList.Where(d => d.ParentCategoryId.HasValue)
                                       .Select(d => d.ParentCategoryId!.Value)
                                       .Distinct()
                                       .ToList();

                if (parentIds.Any())
                {
                    var parents = await _categoryRepository.GetQueryable()
                        .AsNoTracking()
                        .Where(p => parentIds.Contains(p.Id) && !p.IsDeleted)
                        .ToListAsync();

                    var parentDict = parents.ToDictionary(p => p.Id, p => p.CategoryName);

                    foreach (var dto in dtoList)
                    {
                        if (dto.ParentCategoryId.HasValue && parentDict.TryGetValue(dto.ParentCategoryId.Value, out var parentName))
                        {
                            dto.CategoryParentName = parentName;
                        }
                    }
                }

                return dtoList;
            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }

        public async Task<CategoryDto> GetDto(Guid id)
        {
            try
            {
                var query = _categoryRepository.GetQueryable().AsNoTracking();
                if (id != Guid.Empty)
                {
                    query = query.Where(x => x.Id == id);
                }
                query = query.Where(x => !x.IsDeleted);
                var data = await query.FirstOrDefaultAsync();
                var dto = _mapper.Map<Category, CategoryDto>(data);

                if (data != null && data.ParentCategoryId.HasValue && data.ParentCategoryId.Value != Guid.Empty)
                {
                    var parentName = await _categoryRepository.GetQueryable()
                        .AsNoTracking()
                        .Where(p => p.Id == data.ParentCategoryId.Value && !p.IsDeleted)
                        .Select(p => p.CategoryName)
                        .FirstOrDefaultAsync();

                    dto.CategoryParentName = parentName;
                }

                return dto;
            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }

        public Task<bool> IsCategoryNameExist(Guid shopeId, string name, Guid? excludeId = null)
        {
            var data = _categoryRepository.GetQueryable().AsNoTracking()
                .Where(x => x.ShopId == shopeId && x.CategoryName == name && !x.IsDeleted);

            if (excludeId.HasValue && excludeId.Value != Guid.Empty)
            {
                data = data.Where(x => x.Id != excludeId.Value);
            }

            return Task.FromResult(data.Any());
        }
    }
}
