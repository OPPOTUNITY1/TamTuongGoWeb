using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TamTuong.Model.Entities;
using TamTuong.Repository.SellerRepository;
using TamTuong.Repository.Common;
using TamTuong.Service.Common.Service;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.SellerService.Dto;
using TamTuong.Service.SellerService.Request;

namespace TamTuong.Service.SellerService
{
    public class SellerService : Service<Seller>, ISellerService
    {
        private readonly ISellerRepository _sellerRepository;
        private readonly Mapper _mapper;

        public SellerService(IRepository<Seller> repository, ISellerRepository sellerRepository, Mapper mapper) : base(repository)
        {
            _sellerRepository = sellerRepository;
            _mapper = mapper;
        }

        public async Task<List<SellerDto>> GetData(SellerSearchDto search)
        {
            try
            {
                var query = _sellerRepository.GetQueryable().AsNoTracking();

                if (search != null)
                {
                    if (search.Id.HasValue && search.Id.Value != Guid.Empty)
                    {
                        query = query.Where(x => x.Id == search.Id.Value);
                    }
                    if (search.UserId.HasValue && search.UserId.Value != Guid.Empty)
                    {
                        query = query.Where(x => x.UserId == search.UserId.Value);
                    }
                }

                query = query.OrderByDescending(x => x.CreatedDate).Where(x => !x.IsDeleted);
                var data = await query.ToListAsync();
                return _mapper.MapToList<Seller, SellerDto>(data);
            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }

        public async Task<SellerDto> GetDto(Guid id)
        {
            try
            {
                var query = _sellerRepository.GetQueryable().AsNoTracking();
                if (id != Guid.Empty)
                {
                    query = query.Where(x => x.Id == id);
                }
                query = query.Where(x => !x.IsDeleted);
                var data = await query.FirstOrDefaultAsync();
                return _mapper.Map<Seller, SellerDto>(data);
            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }

        public Task<bool> IsSellerExistByUser(Guid userId, Guid? excludeId = null)
        {
            var query = _sellerRepository.GetQueryable().AsNoTracking().Where(x => x.UserId == userId && !x.IsDeleted);
            if (excludeId.HasValue && excludeId.Value != Guid.Empty)
            {
                query = query.Where(x => x.Id != excludeId.Value);
            }
            return query.AnyAsync();
        }
    }
}
