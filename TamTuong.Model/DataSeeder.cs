using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;
using TamTuong.Model.Entities;

namespace TamTuong.Model
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(IServiceProvider services)
        {
            var roleMgr = services.GetRequiredService<RoleManager<Role>>();
            var userMgr = services.GetRequiredService<UserManager<User>>();
            var logger = services.GetService<ILoggerFactory>()?.CreateLogger("DataSeeder");

            // create roles
            string[] roles = new[] { "Admin", "Seller", "Customer" };
            foreach (var r in roles)
            {
                if (!await roleMgr.RoleExistsAsync(r))
                {
                    var role = new Role { Id = Guid.NewGuid(), Name = r, NormalizedName = r.ToUpper() };
                    var res = await roleMgr.CreateAsync(role);
                    if (!res.Succeeded)
                    {
                        logger?.LogError("Failed to create role {Role}: {Errors}", r, string.Join("; ", res.Errors.Select(e => e.Description)));
                    }
                }
            }

            // create admin user
            var adminEmail = "Hoangbaotrung23622@gmail.com";
            var admin = await userMgr.FindByEmailAsync(adminEmail);
            if (admin == null)
            {
                admin = new User
                {
                    Id = Guid.Parse("66666666-6666-6666-6666-666666666666"),
                    UserName = "admin",
                    Email = adminEmail,
                    EmailConfirmed = true,
                    SecurityStamp = Guid.NewGuid().ToString()
                };
                var create = await userMgr.CreateAsync(admin, "Oppotunity23062002.");
                if (create.Succeeded)
                {
                    var addRoleRes = await userMgr.AddToRoleAsync(admin, "Admin");
                    if (!addRoleRes.Succeeded)
                    {
                        logger?.LogError("Failed to add admin to role: {Errors}", string.Join("; ", addRoleRes.Errors.Select(e => e.Description)));
                    }
                    else
                    {
                        logger?.LogInformation("Admin user created and assigned role");
                    }
                }
                else
                {
                    logger?.LogError("Failed to create admin user: {Errors}", string.Join("; ", create.Errors.Select(e => e.Description)));
                }
            }

            // create seller user
            var sellerEmail = "Ductam97@gmail.com";
            var seller = await userMgr.FindByEmailAsync(sellerEmail);
            if (seller == null)
            {
                seller = new User
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    UserName = "seller",
                    Email = sellerEmail,
                    EmailConfirmed = true,
                    SecurityStamp = Guid.NewGuid().ToString()
                };
                // use a stronger password to satisfy default Identity password policy
                var sellerPassword = "Seller@12345";
                var create = await userMgr.CreateAsync(seller, sellerPassword);
                if (create.Succeeded)
                {
                    var addRoleRes = await userMgr.AddToRoleAsync(seller, "Seller");
                    if (!addRoleRes.Succeeded)
                    {
                        logger?.LogError("Failed to add seller to role: {Errors}", string.Join("; ", addRoleRes.Errors.Select(e => e.Description)));
                    }
                    else
                    {
                        logger?.LogInformation($"Seller user created and assigned role (password: {sellerPassword})");
                    }
                }
                else
                {
                    logger?.LogError("Failed to create seller user: {Errors}", string.Join("; ", create.Errors.Select(e => e.Description)));
                }
            }
        }
    }
}
