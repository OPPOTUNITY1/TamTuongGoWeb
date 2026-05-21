using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text;
using TamTuong.Model.Entities;

namespace TamTuong.Repository.Common
{
    public interface IMongoRepository<T> where T : IEntity
    {
        IQueryable<T> GetQueryable();
        Task<IEnumerable<T>> FindBy(Expression<Func<T, bool>> predicate);
        Task<T> CreateAsync(T entity);
        Task<IEnumerable<T>> CreateAsync(IEnumerable<T> entities);
        Task<T> UpdateAsync(T entity);
        Task<IEnumerable<T>> UpdateAsync(IEnumerable<T> entities);
        Task<T> DeleteAsync(T entity);
        Task<T?> GetByIdAsync(Guid? id);
        Task DeleteAsync(IEnumerable<T> entities);
    }
}
