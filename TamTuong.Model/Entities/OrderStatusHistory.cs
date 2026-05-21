using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace TamTuong.Model.Entities
{
    [Table("OrderStatusHistory")]
    public class OrderStatusHistory : AuditableEntity
    {
        public Guid? OrderId { get; set; }
        public string? Status { get; set; }
        public string? Note { get; set; }
        public bool? SendEmail { get; set; }
    }
}
