using Microsoft.EntityFrameworkCore;
using TamTuong.Model.Entities;
using TamTuong.Repository.CartRepository;
using TamTuong.Repository.Common;
using TamTuong.Service.CartService.Dto;
using TamTuong.Service.CartService.Request;
using TamTuong.Service.Common;
using TamTuong.Service.Common.Service;
using TamTuong.Service.Core.Mapper;

namespace TamTuong.Service.CartService
{
    public class CartService : Service<Cart>, ICartService
    {
        private readonly IMapper _mapper;
        private readonly ICartRepository _cartRepository;
        public CartService(IRepository<Cart> repository, IMapper mapper, ICartRepository cartRepository) : base(repository)
        {
            _mapper = mapper;
            _cartRepository = cartRepository;
        }

        // Upsert: if a cart entry already exists for (UserId, ProductId), increment its quantity
        // instead of inserting a duplicate row.
        public override async Task CreateAsync(Cart entity)
        {
            var existing = await _cartRepository.GetQueryableWithTracking()
                .Where(x => x.UserId == entity.UserId && x.ProductId == entity.ProductId && !x.IsDeleted)
                .FirstOrDefaultAsync();

            if (existing != null)
            {
                existing.Quantity = (existing.Quantity ?? 0) + (entity.Quantity ?? 1);
                _cartRepository.Update(existing);
                await _cartRepository.SaveAsync();
                entity.Id = existing.Id;
            }
            else
            {
                await base.CreateAsync(entity);
            }
        }

        public async Task<PagedList<CartDto>> Getdata(CartSearch search)
        {
            try
            {
                var query = _cartRepository.GetQueryable();
                if (search.UserId.HasValue)
                {
                    query = query.Where(x => x.UserId == search.UserId.Value);
                }
                if (search.ProductId.HasValue)
                {
                    query = query.Where(x => x.ProductId == search.ProductId.Value);
                }

                // Apply server-side filters and ordering before pagination so EF can execute async operations
                var dataQuery = query.Where(x => !x.IsDeleted).OrderByDescending(x => x.CreatedDate);

                // Create a paged result of the entity type (Cart) using the EF IQueryable
                var rawPaged = await PagedList<Cart>.CreateAsync(dataQuery, search);

                // Map the entity items to DTOs (mapping happens in-memory on the already materialized page)
                var dtoItems = rawPaged.Items.Select(x => _mapper.Map<Cart, CartDto>(x)).ToList();

                // Return a new PagedList of DTOs preserving paging metadata
                return new PagedList<CartDto>(dtoItems, rawPaged.PageIndex, rawPaged.PageSize, rawPaged.TotalCount);
            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }

        public async Task<CartDto> GetDto(Guid id)
        {
            try
            {
                var data = await _cartRepository.GetQueryable().Where(x => x.Id == id && !x.IsDeleted).FirstOrDefaultAsync();
                if (data == null)
                {
                    throw new System.Exception("Không tìm thấy dữ liệu");
                }
                return _mapper.Map<Cart, CartDto>(data);
            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }

        public async Task<CartDto> RemoveCart(Guid id)
        {
            try
            {
                var entity = await _cartRepository.GetQueryable().Where(x => x.Id == id && !x.IsDeleted).FirstOrDefaultAsync();
                if (entity == null)
                {
                    throw new System.Exception("Không tìm thấy dữ liệu");
                }
                // Soft-delete the cart entry instead of hard-removing the product from the system
                entity.IsDeleted = true;
                entity.DeletedDate = DateTime.UtcNow;
                _cartRepository.Update(entity);
                await _cartRepository.SaveAsync();
                return _mapper.Map<Cart, CartDto>(entity);
            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }

        public async Task<int> RemoveByProductIdAsync(Guid productId)
        {
            try
            {
                // Get all entries (GetAll returns DbSet without IsDeleted filtering)
                var items = await _cartRepository.GetAll().Where(x => x.ProductId == productId).ToListAsync();
                if (items == null || !items.Any()) return 0;
                // Hard delete: remove from DbSet
                foreach (var it in items)
                {
                    _cartRepository.Delete(it);
                }
                await _cartRepository.SaveAsync();
                return items.Count;
            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }
    }
}
