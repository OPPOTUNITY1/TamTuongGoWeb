using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Service.Common.Service;
using TamTuong.Service.UserInformationService.Dto;
using TamTuong.Service.UserInformationService.Request;

namespace TamTuong.Service.UserInformationService
{
    public interface IUserInformationService : IService<UserInformation>
    {
        Task<List<UserInformationDto>> GetData(UserInformationSearchDto search);
        Task<UserInformationDto> GetDto(Guid id);
        Task<List<UserInformationDto>> GetUserInformationByUser(Guid userId);
    }
}
