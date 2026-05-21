using System;

namespace TamTuong.Service.CategoryService.Request
{
    public class CategorySearchDto
    {
        public Guid? Id { get; set; }
        public Guid? ShopId { get; set; }
        public string? CategoryName { get; set; }
        public Guid? ParentCategoryId { get; set; }
    }
}
