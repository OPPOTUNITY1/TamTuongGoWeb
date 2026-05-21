using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace TamTuong.Model.Entities
{

    [Table("Shop")]
    public class Shop : AuditableEntity
    {
        public Guid? SellerId { get; set; }
        public string? Name { get; set; }
    }
}
