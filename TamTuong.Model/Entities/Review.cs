using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace TamTuong.Model.Entities
{
    [Table("Review")]
    public class Review : AuditableEntity
    {
        public Guid? UserId { get; set; }
        public Guid? ProductId { get; set; }
        public Guid? OrderId { get; set; }
        public float? Rating { get; set; }
        public string? Comment { get; set; }
    }
}
