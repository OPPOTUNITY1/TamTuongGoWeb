using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text;
using TamTuong.Model.Entities;

namespace TamTuong.Repository.Common
{
    public interface IRepository<T> where T : class, IAuditableEntity
    {
        Task ExecuteTransactionAsync(Func<Task> action);
        Task<T?> GetByIdAsync(Guid? id);
        T? GetById(Guid? id);
        IQueryable<T> GetQueryable();
        IQueryable<T> GetQueryableWithTracking();
        IEnumerable<T> FindBy(Expression<Func<T, bool>> predicate);
        IQueryable<T> Where(Expression<Func<T, bool>> predicate);
        T Add(T entity);

        T Delete(T entity);

        void Update(T entity);

        Task SaveAsync();

        void Delete(IEnumerable<T> entities);

        void AddRange(IEnumerable<T> entities);

        Task<bool> AnyAsync(Expression<Func<T, bool>> predicate);
        IQueryable<T> GetAll();


    }
}

