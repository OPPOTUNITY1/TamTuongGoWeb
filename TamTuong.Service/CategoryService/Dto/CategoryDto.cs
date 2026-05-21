using TamTuong.Model.Entities;

namespace TamTuong.Service.CategoryService.Dto
{
    public class CategoryDto : Category
    {
        public string? CategoryParentName { get; set; }
    }
}
