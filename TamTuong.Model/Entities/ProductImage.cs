using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using System.Text.Json.Serialization;

namespace TamTuong.Model.Entities
{
    [Table("ProductImage")]
    public class ProductImage : AuditableEntity
    {
        public Guid? ProductId { get; set; }
        public string? ImageUrl { get; set; }
        // Remove navigation to Product to avoid EF creating FK automatically
        // public Product? Product { get; set; }
    }
}
