using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text;
using TamTuong.Model.Entities;
using TamTuong.Service.Dto;

namespace TamTuong.Service.Common.Service
{
    public interface IService<T> where T : class, IAuditableEntity
    {
        Task<T?> GetByIdAsync(Guid? id);
        Task<T> GetByIdOrThrowAsync(Guid? guid);
        Task CreateAsync(T entity);
        Task CreateAsync(IEnumerable<T> entities);
        Task UpdateAsync(T entity);
        Task UpdateAsync(IEnumerable<T> entities);
        void Update(T entity);
        void Update(List<T> entities);
        Task DeleteAsync(T entity);
        IQueryable<T> GetQueryable();
        Task DeleteAsync(IEnumerable<T> entities);
        IEnumerable<T> FindBy(Expression<Func<T, bool>> predicate);
        Task<bool> AnyAsync(Expression<Func<T, bool>> predicate);
        IQueryable<T> Where(Expression<Func<T, bool>> predicate);
        void Delete(Expression<Func<T, bool>> filter);
        Task DeleteRange(IEnumerable<T> entities);
        Task<List<DropdownOption>> GetDropdownOptions<TField, TValue>(Expression<Func<T, TField>> displayField, Expression<Func<T, TValue>> valueField, TValue? selected = default);
        Task CreateRange(IEnumerable<T> entities);
        Task<List<T>> GetAllAsync();
        Task<T?> GetById(Guid? id);
        Task SaveAsync();
        T? GetByGuidId(Guid? id);

    }
}

