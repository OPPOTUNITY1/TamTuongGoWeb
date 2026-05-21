using System;

namespace TamTuong.Service.CategoryService.Request
{
    public class CategoryRequestDto
    {
        public Guid? Id { get; set; }
        public Guid ShopId { get; set; }
        public Guid? SellersId { get; set; }
        public string? CategoryName { get; set; }
        public Guid? ParentCategoryId { get; set; }
    }
}
