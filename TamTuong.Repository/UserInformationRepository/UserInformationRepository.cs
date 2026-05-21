using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Repository.Common;

namespace TamTuong.Repository.UserInformationRepository
{
    public class UserInformationRepository : Repository<UserInformation>, IUserInformationRepository
    {
        public UserInformationRepository(DbContext context) : base(context)
        {
        }
    }
}
