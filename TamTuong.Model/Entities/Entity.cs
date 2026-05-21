using Microsoft.EntityFrameworkCore;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace TamTuong.Model.Entities
{
    public class BaseEntity
    {
        public static bool operator ~(BaseEntity baseEntity) => baseEntity is not null;
    }


    public interface IEntity
    {
        public Guid Id { get; set; }
    }


    [PrimaryKey(nameof(Id))]
    public class Entity : BaseEntity, IEntity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [BsonRepresentation(BsonType.String)]
        public Guid Id { get; set; }
    }
}
