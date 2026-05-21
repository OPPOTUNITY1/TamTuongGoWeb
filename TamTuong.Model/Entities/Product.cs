using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace TamTuong.Model.Entities
{
    [Table("Product")]
    public class Product : AuditableEntity
    {
        public Guid? ShopId { get; set; }
        public Guid? CategoryId { get; set; }
        public string? ProductName { get; set; }
        public float? RetailPrice { get; set; }
        public float? ImportPrice { get; set; }
        public int? Quantity { get; set; }
        public string? Detail { get; set; }
        public string? ThumbnailUrl { get; set; }
        public int? SoldCount { get; set; }
    }
}
