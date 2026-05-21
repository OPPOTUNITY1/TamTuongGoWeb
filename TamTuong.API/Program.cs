using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.FileProviders;
using System.Security.Claims;
using System.Linq;
using TamTuong.Model;
using TamTuong.Model.Entities;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.AccountService;
using TamTuong.Repository.Common;
using TamTuong.Service.Common.Service;
using TamTuong.API.Filter;
using TamTuong.Service.UserInformationService;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Routing.Patterns;
public class Program
{
    private static async Task Main(string[] args)
    {
        

    var builder = WebApplication.CreateBuilder(args);

        // Register IHttpContextAccessor early so it can be injected into DbContext if needed
        builder.Services.AddHttpContextAccessor();
        builder.Services.AddDbContext<TamTuongContext>(options =>
               options.UseSqlServer(builder.Configuration.GetConnectionString("CNN")));
        builder.Services.AddIdentity<User, Role>(options =>
            {
                options.Password.RequiredLength = 6;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireDigit = false;
            })
            .AddEntityFrameworkStores<TamTuongContext>()
            .AddDefaultTokenProviders();
        builder.Services.AddControllers();

            builder.Services.AddScoped<IMapper, Mapper>();
            builder.Services.AddScoped<Mapper>();
            builder.Services.AddScoped<DbContext, TamTuongContext>();
            builder.Services.AddScoped<LogActionFilter>();
            builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
            var repositoryTypes = typeof(IRepository<>).Assembly.GetTypes()
                 .Where(x => !string.IsNullOrEmpty(x.Namespace) && x.Namespace.StartsWith("TamTuong.Repository") && x.Name.EndsWith("Repository"));
            foreach (var intf in repositoryTypes.Where(t => t.IsInterface))
            {
                var impl = repositoryTypes.FirstOrDefault(c => c.IsClass && intf.Name.Substring(1) == c.Name);
                if (impl != null) builder.Services.AddScoped(intf, impl);
            }

            builder.Services.AddScoped(typeof(IService<>), typeof(Service<>));
            var serviceTypes = typeof(IService<>).Assembly.GetTypes()
                 .Where(x => !string.IsNullOrEmpty(x.Namespace) && x.Namespace.StartsWith("TamTuong.Service") && x.Name.EndsWith("Service"));
            foreach (var intf in serviceTypes.Where(t => t.IsInterface))
            {
                var impl = serviceTypes.FirstOrDefault(c => c.IsClass && intf.Name.Substring(1) == c.Name);
                if (impl != null) builder.Services.AddScoped(intf, impl);
            }

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(options =>
        {
            var jwtSecurityScheme = new OpenApiSecurityScheme
            {
                BearerFormat = "JWT",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.Http,
                Scheme = JwtBearerDefaults.AuthenticationScheme,
                Description = "Enter your JWT Access Token",
                Reference = new OpenApiReference
                {
                    Id = JwtBearerDefaults.AuthenticationScheme,
                    Type = ReferenceType.SecurityScheme
                }
            };
            options.AddSecurityDefinition("Bearer", jwtSecurityScheme);
            options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    { jwtSecurityScheme, Array.Empty<string>() }
                });
        });
        // Extract JWT configuration values
        var issuer = builder.Configuration["JwtConfig:Issuer"];
        var audience = builder.Configuration["JwtConfig:Audience"];
        var key = builder.Configuration["JwtConfig:Key"];
        var tokenValidityMins = builder.Configuration.GetValue<int>("JwtConfig:ToKenValidityMins");



        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false;
            options.SaveToken = true;
            // Disable automatic claim type mapping so JWT claims keep their original short names
            // (e.g. "nameid", "role") instead of being mapped to full URI claim types.
            // Controllers read claims by short name as fallback anyway.
            options.MapInboundClaims = false;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer = issuer,
                ValidAudience = audience,
                IssuerSigningKey = new SymmetricSecurityKey(
                    System.Text.Encoding.UTF8.GetBytes(
                        key ?? throw new InvalidOperationException("JwtConfig:Key is missing")
                    )),
                // With MapInboundClaims = false, use short names directly
                RoleClaimType = "role",
                NameClaimType = "nameid"
            };
        });

        builder.Services.AddAuthorization();

        // Cau hinh rieng biet
        builder.Services.AddAuthorization(options =>
        {

            options.AddPolicy("AdminOnly", policy =>
                policy.RequireRole("Admin"));

            options.AddPolicy("SellerOnly", policy =>
                policy.RequireRole("Seller"));

            options.AddPolicy("CustomerOnly", policy =>
                policy.RequireRole("Customer"));

            options.AddPolicy("AdminAndSeller", policy =>
                policy.RequireRole("Admin", "Seller"));
        });
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowClient",
                policy =>
                {
                    policy
                        .WithOrigins(
                        "http://localhost:3000",
                        "http://localhost:3001",
                        "http://localhost:5173",
                        "http://localhost:5174",
                        "http://localhost:5175",
                        "http://localhost:5176"
                    )
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
                });
        });

        var app = builder.Build();
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    // ensure database is created and migrations applied
                    var ctx = services.GetRequiredService<TamTuongContext>();
                    ctx.Database.Migrate();

                    await ctx.Database.ExecuteSqlRawAsync(@"
                        IF COL_LENGTH('dbo.ProductImage', 'ProductId') IS NULL
                    BEGIN
                        ALTER TABLE [dbo].[ProductImage] ADD [ProductId] uniqueidentifier NULL;
END

IF COL_LENGTH('dbo.ProductImage', 'ImageUrl') IS NULL
BEGIN
    ALTER TABLE [dbo].[ProductImage] ADD [ImageUrl] nvarchar(max) NULL;
END
");

                    await DataSeeder.SeedAsync(services);
                }
                catch (Exception ex)
                {
                    var logger = services.GetService<ILoggerFactory>()?.CreateLogger("DataSeeder");
                    logger?.LogError(ex, "An error occurred seeding the DB.");
                }
            }

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            // Show detailed exceptions in development to help debugging Swagger generation errors
            app.UseDeveloperExceptionPage();
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();

        var webRootPath = app.Environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRootPath))
        {
            webRootPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
        }

        var uploadsPath = Path.Combine(webRootPath, "uploads");
        if (!Directory.Exists(uploadsPath))
        {
            Directory.CreateDirectory(uploadsPath);
        }

        app.UseStaticFiles();
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(uploadsPath),
            RequestPath = "/uploads"
        });

        // Ensure authentication middleware is registered before authorization
        app.UseAuthentication();

        app.UseAuthorization();

        app.MapControllers();

        if (app.Environment.IsDevelopment())
        {
            try
            {
                var logger = app.Services.GetRequiredService<ILoggerFactory>()?.CreateLogger("EndpointList");
                var endpointDataSource = app.Services.GetService<EndpointDataSource>();
                if (endpointDataSource != null && logger != null)
                {
                    foreach (var endpoint in endpointDataSource.Endpoints)
                    {
                        if (endpoint is RouteEndpoint routeEndpoint)
                        {
                            var httpMethods = endpoint.Metadata.GetMetadata<Microsoft.AspNetCore.Routing.HttpMethodMetadata>()?.HttpMethods ?? Enumerable.Empty<string>();
                            logger.LogInformation("Endpoint: {Pattern} Methods: {Methods} DisplayName: {DisplayName}", routeEndpoint.RoutePattern.RawText, string.Join(',', httpMethods), endpoint.DisplayName);
                        }
                        else
                        {
                            logger.LogInformation("Endpoint: {DisplayName} Type: {Type}", endpoint.DisplayName, endpoint.GetType().FullName);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                var l = app.Services.GetService<ILoggerFactory>()?.CreateLogger("EndpointList");
                l?.LogError(ex, "Failed to list endpoints");
            }
        }

        app.Run();
    }
}