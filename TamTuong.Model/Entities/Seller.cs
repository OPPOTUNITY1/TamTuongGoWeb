using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace TamTuong.Model.Entities
{
    [Table("Seller")]
    public class Seller : AuditableEntity
    {
        public Guid? UserId { get; set; }
        public string? BusinessName { get; set; }
        public string? TaxCode { get; set; }
    }
}
