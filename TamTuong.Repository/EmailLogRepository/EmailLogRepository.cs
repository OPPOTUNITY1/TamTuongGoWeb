using Microsoft.EntityFrameworkCore;
using TamTuong.Model.Entities;
using TamTuong.Repository.Common;

namespace TamTuong.Repository.EmailLogRepository
{
    public class EmailLogRepository : Repository<EmailLog>, IEmailLogRepository
    {
        public EmailLogRepository(DbContext context) : base(context)
        {
        }
    }
}
