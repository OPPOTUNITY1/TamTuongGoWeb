using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;
using TamTuong.Model.Entities;

namespace TamTuong.Model
{
    public class TamTuongContext : IdentityDbContext<User, Role, Guid>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        public TamTuongContext(DbContextOptions<TamTuongContext> options, IHttpContextAccessor httpContextAccessor) : base(options)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public TamTuongContext(DbContextOptions<TamTuongContext> options)
            : this(options, new HttpContextAccessor())
        {
        }

        public DbSet<Shop> Shops { get; set; }
        public DbSet<Seller> Sellers { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<Category> Categories { get; set; }

        public DbSet<UserInformation> UserInformations { get; set; }
        public DbSet<Cart> Carts { get; set; }  

        public DbSet<Review> Reviews { get; set; }
        public DbSet<ReviewImage> ReviewImages { get; set; }

        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<OrderPromotion> OrderPromotions { get; set; }
        public DbSet<OrderStatusHistory> OrderStatusHistories { get; set; }

        public DbSet<Payment> Payments { get; set; }
        public DbSet<EmailLog> EmailLogs { get; set; }

        public DbSet<Promotion> Promotions { get; set; }
        public DbSet<PromotionUsage> PromotionUsages { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                var conn = Environment.GetEnvironmentVariable("ConnectionStrings__CNN");
                if (string.IsNullOrWhiteSpace(conn))
                {
                    conn = "Server=.\\SQLEXPRESS;Database=TamTuongAPI;Trusted_Connection=True;TrustServerCertificate=True;";
                }

                optionsBuilder.UseSqlServer(conn);
            }

            base.OnConfiguring(optionsBuilder);
        }
        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker.Entries<AuditableEntity>();

            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var userId);
            var userName = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Surname);
            foreach (var entry in entries)
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.CreatedDate = DateTime.Now;
                    entry.Entity.CreatedId = userId;
                    entry.Entity.CreatedBy = userName;
                }
                else if (entry.State == EntityState.Modified)
                {
                    entry.Entity.UpdatedDate = DateTime.Now;
                    entry.Entity.UpdatedId = userId;
                    entry.Entity.UpdatedBy = userName;
                }
                else if (entry.State == EntityState.Deleted)
                {
                    entry.State = EntityState.Modified;
                    entry.Entity.IsDeleted = true;
                    entry.Entity.DeletedDate = DateTime.Now;
                    entry.Entity.DeletedId = userId;
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }

    }
}
