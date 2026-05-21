using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TamTuong.Model.Entities;
using TamTuong.Repository.CategoryRepository;
using TamTuong.Repository.Common;
using TamTuong.Repository.ProductRepository;
using TamTuong.Repository.ShopRepository;
using TamTuong.Service.Common;
using TamTuong.Service.Common.Service;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.ProductService.Dto;
using TamTuong.Service.ProductService.Request;
using TamTuong.Repository.ProductImageRepository;

namespace TamTuong.Service.ProductService
{
    public class ProductService : Service<Product>, IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly IShopRepository _shopRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IProductImageRepository _productImageRepository;
        private readonly Mapper _mapper;
        private readonly IRepository<ProductImage> _productImageRepositoryGeneric;
        public ProductService(IRepository<Product> repository, IProductRepository productRepository, IShopRepository shopRepository, ICategoryRepository categoryRepository, IProductImageRepository productImageRepository, Mapper mapper) : base(repository)
        {
            _productRepository = productRepository;
            _shopRepository = shopRepository;
            _categoryRepository = categoryRepository;
            _productImageRepository = productImageRepository;
            _productImageRepositoryGeneric = productImageRepository;
            _mapper = mapper;
        }

        public async Task<PagedList<ProductDto>> GetData(ProductSearchDto search)
        {
            try
            {
                var query = 
                    from p in _productRepository.GetQueryable().AsNoTracking().Where(x => !x.IsDeleted)
                    join s in _shopRepository.GetQueryable().AsNoTracking() on p.ShopId equals s.Id into ps
                    from s in ps.DefaultIfEmpty()
                    join c in _categoryRepository.GetQueryable().AsNoTracking() on p.CategoryId equals c.Id into pc
                    from c in pc.DefaultIfEmpty()
                    select new
                    {
                        p.Id,
                        p.ShopId,
                        p.CategoryId,
                        p.ProductName,
                        p.RetailPrice,
                        p.ImportPrice,
                        p.Quantity,
                        p.Detail,
                        p.ThumbnailUrl,
                        p.SoldCount,
                        p.CreatedDate,
                        ShopName = s != null ? s.Name : null,
                        CategoryName = c != null ? c.CategoryName : null
                    };
                    if (search.Id.HasValue && search.Id.Value != Guid.Empty)
                    {
                        query = query.Where(x => x.Id == search.Id.Value);
                    }
                    if (search.ShopId.HasValue && search.ShopId.Value != Guid.Empty)
                    {
                        query = query.Where(x => x.ShopId == search.ShopId.Value);
                    }
                    if (!string.IsNullOrWhiteSpace(search.ProductName))
                    {
                        query = query.Where(x => x.ProductName != null && x.ProductName.Contains(search.ProductName));
                    }
                    if (search.RetailPrice.HasValue)
                    {
                        query = query.Where(x => x.RetailPrice == search.RetailPrice.Value);
                    }

                var dataQuery = query
                    .OrderByDescending(x => x.CreatedDate)
                    .Select(x => new ProductDto
                    {
                        Id = x.Id,
                        ShopId = x.ShopId,
                        CategoryId = x.CategoryId,
                        ProductName = x.ProductName,
                        RetailPrice = x.RetailPrice,
                        ImportPrice = x.ImportPrice,
                        Quantity = x.Quantity,
                        Detail = x.Detail,
                        ThumbnailUrl = x.ThumbnailUrl,
                        SoldCount = x.SoldCount,
                        CreatedDate = x.CreatedDate,
                        ShopName = x.ShopName,
                        CategoryName = x.CategoryName
                    });

                var paged = await PagedList<ProductDto>.CreateAsync(dataQuery, search);

                // Load product images for the returned page items
                var productIdsOnPage = paged.Items?.Where(i => i.Id != Guid.Empty).Select(i => i.Id).ToList();
                if (productIdsOnPage != null && productIdsOnPage.Any())
                {
                    var images = await _productImageRepository.GetQueryable().AsNoTracking()
                        .Where(img => !img.IsDeleted && img.ProductId != null && productIdsOnPage.Contains(img.ProductId.Value))
                        .ToListAsync();

                    var map = images.GroupBy(i => i.ProductId.Value).ToDictionary(g => g.Key, g => g.Where(i => !i.IsDeleted).ToList());

                    foreach (var prod in paged.Items)
                    {
                        if (prod.ProductImages == null) prod.ProductImages = new List<ProductImage>();
                        if (prod.Id != Guid.Empty && map.TryGetValue(prod.Id, out var list))
                        {
                            prod.ProductImages = list;
                        }
                    }
                }

                return paged;
            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }

        public async Task<ProductDto> GetDto(Guid id)
        {
            try
            {
                var query =
                    from p in _productRepository.GetQueryable().AsNoTracking().Where(x=> !x.IsDeleted)
                    join s in _shopRepository.GetQueryable().AsNoTracking() on p.ShopId equals s.Id into ps
                    from s in ps.DefaultIfEmpty()
                    join c in _categoryRepository.GetQueryable().AsNoTracking() on p.CategoryId equals c.Id into pc
                    from c in pc.DefaultIfEmpty()
                    select new ProductDto
                    {
                        Id = p.Id,
                        ShopId = p.ShopId,
                        CategoryId = p.CategoryId,
                        ProductName = p.ProductName,
                        RetailPrice = p.RetailPrice,
                        ImportPrice = p.ImportPrice,
                        Quantity = p.Quantity,
                        Detail = p.Detail,
                        ThumbnailUrl = p.ThumbnailUrl,
                        SoldCount = p.SoldCount,
                        ShopName = s != null ? s.Name : null,
                        CategoryName = c != null ? c.CategoryName : null
                    };
                if (id != Guid.Empty)
                {
                    query = query.Where(x => x.Id == id);
                }
                var data = await query.FirstOrDefaultAsync();
                return _mapper.Map<Product, ProductDto>(data);
            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }

        public async Task<List<ProductDto>> GetProductByShop(Guid shopId)
        {
            var query =
                    from p in _productRepository.GetQueryable().AsNoTracking().Where(x => !x.IsDeleted && x.ShopId == shopId)
                    join s in _shopRepository.GetQueryable().AsNoTracking() on p.ShopId equals s.Id into ps
                    from s in ps.DefaultIfEmpty()
                    join c in _categoryRepository.GetQueryable().AsNoTracking() on p.CategoryId equals c.Id into pc
                    from c in pc.DefaultIfEmpty()
                    select new ProductDto
                    {
                        Id = p.Id,
                        ShopId = p.ShopId,
                        CategoryId = p.CategoryId,
                        ProductName = p.ProductName,
                        RetailPrice = p.RetailPrice,
                        ImportPrice = p.ImportPrice,
                        Quantity = p.Quantity,
                        Detail = p.Detail,
                        ThumbnailUrl = p.ThumbnailUrl,
                        SoldCount = p.SoldCount,
                        ShopName = s != null ? s.Name : null,
                        CategoryName = c != null ? c.CategoryName : null,
                        // ProductImages will be loaded separately to avoid EF creating implicit joins
                    };
            var products = await query.ToListAsync();

            var productIds = products.Select(p => p.Id).ToList();
            if (productIds.Any())
            {
                var images = await _productImageRepository.GetQueryable().AsNoTracking()
                    .Where(img => !img.IsDeleted && img.ProductId != null && productIds.Contains(img.ProductId.Value))
                    .ToListAsync();

                var map = images.GroupBy(i => i.ProductId.Value).ToDictionary(g => g.Key, g => g.Where(i => !i.IsDeleted).ToList());

                foreach (var prod in products)
                {
                    if (prod.ProductImages == null) prod.ProductImages = new List<ProductImage>();
                    if (prod.Id != Guid.Empty && map.TryGetValue(prod.Id, out var list))
                    {
                        prod.ProductImages = list;
                    }
                }
            }

            return products;
        }

        public Task<bool> IsProductNameExist(Guid shopId, string productName, Guid? excludeId = null)
        {
            var normalizedProductName = productName?.Trim().ToLower();
            var query = _productRepository.GetQueryable().AsNoTracking()
                .Where(x => x.ShopId == shopId && !x.IsDeleted && x.ProductName.ToLower() == normalizedProductName );
            
            if (excludeId.HasValue && excludeId.Value != Guid.Empty)
            {
                query = query.Where(x => x.Id != excludeId.Value);
            }

            return query.AnyAsync();
        }

        public async Task<ProductDto> CreateProductAsync(ProductRequestDto request)
        {
            // Map request to entity
            var entity = _mapper.Map<ProductRequestDto, Product>(request);

            // Save product first to get Id
            await CreateAsync(entity);

            // If there are images in request, add them
            if (request.ProductImages != null && request.ProductImages.Any())
            {
                foreach (var img in request.ProductImages.Where(i => !string.IsNullOrWhiteSpace(i.ImageUrl)))
                {
                    var pi = new ProductImage
                    {
                        ProductId = entity.Id,
                        ImageUrl = img.ImageUrl
                    };
                    _productImageRepositoryGeneric.Add(pi);
                }
                await _productImageRepositoryGeneric.SaveAsync();
            }

            var dto = _mapper.Map<Product, ProductDto>(entity);
            // load images
            dto.ProductImages = _productImageRepository.GetQueryable().AsNoTracking()
                .Where(x => x.ProductId == entity.Id && !x.IsDeleted)
                .ToList();
            return dto;
        }

        public async Task<ProductDto> UpdateProductAsync(ProductRequestDto request)
        {
            if (request.Id == null || request.Id == Guid.Empty)
                throw new ArgumentException("Id sản phẩm là bắt buộc để cập nhật");

            var existing = await GetByIdAsync(request.Id);
            if (existing == null)
                throw new System.Exception("Sản phẩm không tồn tại");

            // Update scalar fields
            _mapper.Map(request, existing);
            await UpdateAsync(existing);

            // Reconcile images: hard delete images that are not present in request
            var existingImages = await _productImageRepository.GetQueryable().Where(x => x.ProductId == existing.Id).ToListAsync();

            var requestImageIds = request.ProductImages?.Where(i => i.Id != Guid.Empty).Select(i => i.Id).ToHashSet() ?? new HashSet<Guid>();

            // Delete images that exist in DB but not in request
            var toDelete = existingImages.Where(i => !requestImageIds.Contains(i.Id)).ToList();
            if (toDelete.Any())
            {
                // Use repository Delete which performs hard delete
                _productImageRepository.Delete(toDelete);
                await _productImageRepository.SaveAsync();
            }

            // Add new images from request (Id == Guid.Empty)
            var toAdd = request.ProductImages?.Where(i => i.Id == Guid.Empty && !string.IsNullOrWhiteSpace(i.ImageUrl)).ToList();
            if (toAdd != null && toAdd.Any())
            {
                foreach (var img in toAdd)
                {
                    _productImageRepositoryGeneric.Add(new ProductImage { ProductId = existing.Id, ImageUrl = img.ImageUrl });
                }
                await _productImageRepositoryGeneric.SaveAsync();
            }

            var dto = _mapper.Map<Product, ProductDto>(existing);
            dto.ProductImages = await _productImageRepository.GetQueryable().AsNoTracking().Where(x => x.ProductId == existing.Id).ToListAsync();
            return dto;
        }

    }
}
