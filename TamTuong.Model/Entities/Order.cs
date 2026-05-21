using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace TamTuong.Model.Entities
{
    [Table("Order")]
    public class Order : AuditableEntity
    {
        public Guid? UserId { get; set; }
        public Guid? UserInformationId { get; set; }
        public DateTime? OrderDate { get; set; }
        public float? TotalAmount { get; set; }
        public string? Status { get; set; }
        public float? DiscountAmount { get; set; }
    }
}
