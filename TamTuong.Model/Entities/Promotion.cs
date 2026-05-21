using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace TamTuong.Model.Entities
{
    [Table("Promotion")]
    public class Promotion : AuditableEntity
    {
        public Guid? ShopId { get; set; }
        public string? Code { get; set; }
        public string? Description { get; set; }
        public string? DiscountType { get; set; }
        public float? DiscountValue { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? UsageLimit { get; set; }
        public int? UsedCount { get; set; }
        public string? Scope { get; set; }
        public float? MinPurchase { get; set; }
        public float? MaxDiscount { get; set; }
    }
}
