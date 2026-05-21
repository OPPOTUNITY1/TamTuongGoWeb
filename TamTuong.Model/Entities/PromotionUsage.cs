using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace TamTuong.Model.Entities
{
    [Table("PromotionUsage")]
    public class PromotionUsage : AuditableEntity
    {
        public Guid? PromotionId { get; set; }
        public Guid? OrderId { get; set; }
        public Guid? UserId { get; set; }
        public DateTime? UsedAt { get; set; }
        public float? DiscountAmount { get; set; }
    }
}
