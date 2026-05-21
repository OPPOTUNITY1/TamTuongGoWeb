using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Service.Common.Dto;

namespace TamTuong.Service.Common.Service
{
    public interface IMongoService<T> where T : IEntity
    {
        Task<T?> GetByIdAsync(Guid? guid);
        Task<T> GetByIdOrThrowAsync(Guid? guid);
        Task CreateAsync(T entity);
        Task CreateAsync(IEnumerable<T> entities);
        Task UpdateAsync(T entity);
        Task UpdateAsync(IEnumerable<T> entities);
        Task DeleteAsync(T entity);
        Task DeleteAsync(IEnumerable<T> entities);
        IQueryable<T> GetQueryable();
        IQueryable<T> Where(Expression<Func<T, bool>> predicate);
        Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate);
        Task<int> Count(Expression<Func<T, bool>> predicate);

        Task<List<SelectAntd>> GetDropDown(string labelField, string valueField);
    }
}