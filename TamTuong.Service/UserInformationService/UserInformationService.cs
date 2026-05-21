using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Repository.Common;
using TamTuong.Repository.UserInformationRepository;
using TamTuong.Service.Common.Service;
using TamTuong.Service.Core.Mapper;
using TamTuong.Service.UserInformationService.Dto;
using TamTuong.Service.UserInformationService.Request;

namespace TamTuong.Service.UserInformationService
{
    public class UserInformationService : Service<UserInformation>, IUserInformationService
    {
        private readonly IUserInformationRepository _userInformationRepository;
        private readonly IMapper _mapper;
        public UserInformationService(IRepository<UserInformation> repository, IUserInformationRepository userInformationRepository, IMapper mapper) : base(repository)
        {
            _userInformationRepository = userInformationRepository;
            _mapper = mapper;
        }

        public async Task<List<UserInformationDto>> GetData(UserInformationSearchDto search)
        {
            try
            {
                var query = GetQueryable().AsNoTracking();
                if(search != null && search.UserId.HasValue)
                {
                    query = query.Where(x => x.UserId == search.UserId.Value);
                }
                query = query.OrderByDescending(x => x.CreatedDate).Where(x=> !x.IsDeleted);
                var data = await query.ToListAsync();
                return _mapper.MapToList<UserInformation, UserInformationDto>(data);
            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }

        public async Task<UserInformationDto> GetDto(Guid id)
        {
            try
            {
                var query = GetQueryable().AsNoTracking();
                if(id != Guid.Empty)
                {
                    query = query.Where(x => x.Id == id);
                }
                query = query.Where(x=> !x.IsDeleted);
                var data = await query.FirstOrDefaultAsync();
                return _mapper.Map<UserInformation, UserInformationDto>(data);
            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }

        public async Task<List<UserInformationDto>> GetUserInformationByUser(Guid userId)
        {
            try
            {
                var query = GetQueryable().AsNoTracking();
                if(userId != Guid.Empty)
                {
                    query = query.Where(x => x.UserId == userId);
                }
                query = query.OrderByDescending(x => x.CreatedDate).Where(x=> !x.IsDeleted);
                var data = await query.ToListAsync();
                return _mapper.MapToList<UserInformation, UserInformationDto>(data);
            }
            catch (System.Exception ex)
            {
                throw new System.Exception(ex.Message);
            }
        }
    }
}
