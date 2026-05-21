using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace TamTuong.Model.Entities
{
    [Table("EmailLog")]
    public class EmailLog : AuditableEntity
    {
        public Guid? SellerId { get; set; }
        public Guid? OrderId { get; set; }
        public string? ToEmail { get; set; }
        public string? Subject { get; set; }
        public string? Body { get; set; }
        public string? Status { get; set; }
        public DateTime? SentAt { get; set; }
        public string? ErrorMessage { get; set; }
    }
}
