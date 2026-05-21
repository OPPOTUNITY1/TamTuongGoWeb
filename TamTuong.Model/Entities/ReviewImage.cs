using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace TamTuong.Model.Entities
{
    [Table("ReviewImage")]
    public class ReviewImage : AuditableEntity
    {
        public Guid? ReviewId { get; set; }
        public string? ImageUrl { get; set; }
        public int? SortOrder { get; set; }
    }
}
