using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace TamTuong.Model.Entities
{
    [Table("OrderPromotion")]
    public class OrderPromotion : AuditableEntity
    {
        public Guid? OrderId { get; set; }
        public Guid? PromotionId { get; set; }
        public Guid? ShopId { get; set; }
        public float? DiscountAmount { get; set; }
    }
}
