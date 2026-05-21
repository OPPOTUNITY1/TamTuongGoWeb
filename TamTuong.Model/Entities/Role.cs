using Microsoft.AspNetCore.Identity;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace TamTuong.Model.Entities
{
    [Table("Role")]
    public class Role : IdentityRole<Guid>, IEntity
    {
    }
}
