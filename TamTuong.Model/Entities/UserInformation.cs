using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace TamTuong.Model.Entities
{
    [Table("UserInformation")]
    public class UserInformation : AuditableEntity
    {
        public Guid? UserId { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? StreetAddress { get; set; }
        public string? BuildingInfo { get; set; }
        public string? District { get; set; }
        public string? Ward { get; set; }
        public string? City { get; set; }
        public string? PhoneNumber { get; set; }
    }
}
