using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace TamTuong.Model.Entities
{
    [Table("User")]
    public class User : IdentityUser<Guid>, IAuditableEntity
    {
        public string? ImageUrl { get; set; }
        public string? FullName { get; set; }
        public DateTime CreatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public Guid? CreatedId { get; set; }
        public DateTime UpdatedDate { get; set; }
        public Guid? UpdatedId { get; set; }
        public string? UpdatedBy { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedDate { get; set; }
        public Guid? DeletedId { get; set; }
    }
}
