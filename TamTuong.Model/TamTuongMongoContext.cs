using Microsoft.AspNetCore.Http;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;
using MongoDbGenericRepository;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;
using TamTuong.Model.Entities;

namespace TamTuong.Model
{
    public class TamTuongMongoContext : IMongoDbContext
    {
        public readonly IMongoDatabase Database;
        private readonly IMongoClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TamTuongMongoContext(IMongoClient client, string databaseName, IHttpContextAccessor httpContextAccessor)
        {
            _client = client;
            Database = client.GetDatabase(databaseName);
            _httpContextAccessor = httpContextAccessor;

            // Set the GuidRepresentation to Standard
            SetGuidRepresentation(GuidRepresentation.Standard);
        }

        public IMongoClient Client => _client;

        IMongoDatabase IMongoDbContext.Database => Database;

        public void DropCollection<TDocument>(string? partitionKey = null)
        {
            Database.DropCollection(GetCollectionName<TDocument>());
        }

        public IMongoCollection<TDocument> GetCollection<TDocument>(string partitionKey = null)
        {
            return Database.GetCollection<TDocument>(GetCollectionName<TDocument>());
        }

        public void SetGuidRepresentation(GuidRepresentation guidRepresentation)
        {
            var existingSerializer = BsonSerializer.LookupSerializer<Guid>();
            if (existingSerializer is not GuidSerializer)
            {
                BsonSerializer.RegisterSerializer(new GuidSerializer(guidRepresentation));
            }
        }

        private string GetCollectionName<TDocument>()
        {
            return typeof(TDocument).Name;
        }

        public void AuditFields<T>(T entity)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var userId);
            var userName = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Name);
            if (entity is AuditableEntity entityMongo)
            {
                AuditFields(entityMongo, userId, userName);
            }
        }

        public void AuditFields<T>(IEnumerable<T> entities)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var userId);
            var userName = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Name);
            foreach (var entity in entities)
            {
                if (entity is AuditableEntity entityMongo)
                {
                    AuditFields(entityMongo, userId, userName);
                }
            }
        }

        private void AuditFields(AuditableEntity entity, Guid userId, string userName)
        {
            if (entity.Id == Guid.Empty)
            {
                entity.Id = Guid.NewGuid();
                entity.CreatedBy = userName;
                entity.CreatedId = userId;
                entity.CreatedDate = DateTime.Now;
            }
            entity.UpdatedBy = userName;
            entity.UpdatedId = userId;
            entity.UpdatedDate = DateTime.Now;

            foreach (var property in entity.GetType().GetProperties())
            {
                if (typeof(AuditableEntity).IsAssignableFrom(property.PropertyType))
                {
                    var subEntity = property.GetValue(entity) as AuditableEntity;
                    if (subEntity != null)
                    {
                        AuditFields(subEntity, userId, userName);
                    }
                }
                else if (typeof(IEnumerable<AuditableEntity>).IsAssignableFrom(property.PropertyType))
                {
                    var subEntities = property.GetValue(entity) as IEnumerable<AuditableEntity>;
                    if (subEntities != null)
                    {
                        foreach (var subEntity in subEntities)
                        {
                            AuditFields(subEntity, userId, userName);
                        }
                    }
                }
            }
        }
    }
}
