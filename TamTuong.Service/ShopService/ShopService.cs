using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TamTuong.Model.Entities;
using TamTuong.Repository.Common;
using TamTuong.Repository.SellerRepository;
using TamTuong.Repository.ShopRepository;
using TamTuong.Service.Common;
using TamTuong.Service.Common.Service;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.ProductService.Dto;
using TamTuong.Service.ShopService.Dto;
using TamTuong.Service.ShopService.Request;

namespace TamTuong.Service.ShopService
{
    public class ShopService : Service<Shop>, IShopService
    {
        private readonly IShopRepository _shopRepository;
        private readonly Mapper _mapper;
        private readonly ISellerRepository _sellerRepository;

        public ShopService(IRepository<Shop> repository, IShopRepository shopRepository, ISellerRepository sellerRepository, Mapper mapper) : base(repository)
        {
            _shopRepository = shopRepository;
            _sellerRepository = sellerRepository;
            _mapper = mapper;
        }

        public async Task<PagedList<ShopDto>> GetData(ShopSearchDto search)
        {
            try
            {
                var query = from sh in _shopRepository.GetQueryable().AsNoTracking().Where(x => !x.IsDeleted)
                            join se in _sellerRepository.GetQueryable().AsNoTracking() on sh.SellerId equals se.Id into shSe
                            from se in shSe.DefaultIfEmpty()
                            select new ShopDto
                            {
                                Id = sh.Id,
                                Name = sh.Name,
                                SellerId = sh.SellerId,
                                SellerName = se != null ? se.BusinessName : null,
                                CreatedDate = sh.CreatedDate,
                                IsDeleted = sh.IsDeleted
                            };

                if (search != null)
                {
                    if (search.Id.HasValue && search.Id.Value != Guid.Empty)
                    {
                        query = query.Where(x => x.Id == search.Id.Value);
                    }
                    if (search.SellerId.HasValue && search.SellerId.Value != Guid.Empty)
                    {
                        query = query.Where(x => x.SellerId == search.SellerId.Value);
                    }
                    if (!string.IsNullOrWhiteSpace(search.Name))
                    {
                        query = query.Where(x => x.Name != null && x.Name.Contains(search.Name));
                    }
                }

                query = query.OrderByDescending(x => x.CreatedDate);
                return await PagedList<ShopDto>.CreateAsync(query, search);
            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }

        public async Task<ShopDto> GetDto(Guid id)
        {
            try
            {
                var query = _shopRepository.GetQueryable().AsNoTracking();
                if (id != Guid.Empty)
                {
                    query = query.Where(x => x.Id == id);
                }
                query = query.Where(x => !x.IsDeleted);
                var data = await query.FirstOrDefaultAsync();
                return _mapper.Map<Shop, ShopDto>(data);
            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }

        public async Task<List<ShopDto>> GetShopBySeller(Guid sellerId)
        {
            var data = await _shopRepository.GetQueryable().AsNoTracking()
                .Where(x => x.SellerId == sellerId && !x.IsDeleted)
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();
            return _mapper.MapToList<Shop, ShopDto>(data);
        }

        public async Task<bool> IsShopNameExist(Guid userId, string name, Guid? excludeId = null)
        {
            var normalizedProductName = name?.Trim().ToLower();
            var query = _shopRepository.GetQueryable().AsNoTracking()
                .Where(x => x.SellerId == userId && x.Name.ToLower() == normalizedProductName && !x.IsDeleted);

            if (excludeId.HasValue && excludeId.Value != Guid.Empty)
            {
                query = query.Where(x => x.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }
    }
}
