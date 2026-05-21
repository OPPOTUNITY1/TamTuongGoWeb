using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Service.Dto;

namespace TamTuong.Service.UserInformationService.Request
{
    public class UserInformationSearchDto : SearchBase
    {
        public Guid? UserId { get; set; } 
    }
}
