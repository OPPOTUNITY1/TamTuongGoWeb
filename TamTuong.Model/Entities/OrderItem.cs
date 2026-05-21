using System.ComponentModel.DataAnnotations.Schema;

namespace TamTuong.Model.Entities
{
    [Table("OrderItem")]
    public class OrderItem : AuditableEntity
    {
        public Guid? ShopId { get; set; }
        public Guid? OrderId { get; set; }
        public Guid? ProductId { get; set; }
        public int? Quantity { get; set; }
        public float? UnitPrice { get; set; }
    }
}