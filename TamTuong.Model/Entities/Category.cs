using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace TamTuong.Model.Entities
{
    [Table("Category")]
    public class Category : AuditableEntity 
    {
        public Guid? ShopId { get; set; }
        public Guid? SellersId { get; set; }
        public string? CategoryName { get; set; }
        public Guid? ParentCategoryId { get; set; }
    }
}
