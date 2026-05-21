using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace TamTuong.Model.Entities
{
    [Table("Payment")]
    public class Payment : AuditableEntity
    {
        public Guid? OrderId { get; set; }
        public string? Method { get; set; }
        public string? Status { get; set; }
        public string? TransactionCode { get; set; }
    }
}
