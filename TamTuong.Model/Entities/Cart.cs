using Microsoft.EntityFrameworkCore;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace TamTuong.Model.Entities
{
    [Table("Cart")]
    [Index(nameof(UserId), nameof(ProductId), IsUnique = true)]
    public class Cart : AuditableEntity
    {
        public Guid? UserId { get; set; }
        public Guid? ProductId { get; set; }
        public int? Quantity { get; set; }
    }
}
