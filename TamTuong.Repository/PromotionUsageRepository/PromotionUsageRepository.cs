using Microsoft.EntityFrameworkCore;
using TamTuong.Model.Entities;
using TamTuong.Repository.Common;

namespace TamTuong.Repository.PromotionUsageRepository
{
    public class PromotionUsageRepository : Repository<PromotionUsage>, IPromotionUsageRepository
    {
        public PromotionUsageRepository(DbContext context) : base(context)
        {
        }
    }
}
