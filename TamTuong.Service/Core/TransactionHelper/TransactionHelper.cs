using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using System;
using System.Collections.Generic;
using System.Data;
using System.Text;

namespace TamTuong.Service.Core.TransactionHelper
{
    public class TransactionHelper : ITransactionHelper
    {
        private readonly DbContext _context;

        public TransactionHelper(DbContext context)
        {
            _context = context;
        }

        public async Task<ITransaction> BeginTransactionAsync(IsolationLevel? isolationLevel = null)
        {
            IDbContextTransaction tx;

            // Nếu có truyền CapDo (ví dụ Serializable) thì dùng CapDo đó
            if (isolationLevel.HasValue)
            {
                tx = await _context.Database.BeginTransactionAsync(isolationLevel.Value);
            }
            else
            {
                // Nếu không truyền thì dùng mặc định của Database (thường là ReadCommitted)
                tx = await _context.Database.BeginTransactionAsync();
            }

            return new EfTransaction(tx, _context);
        }

        public class EfTransaction : ITransaction
        {
            private readonly IDbContextTransaction _tx;
            private readonly DbContext _context;

            public EfTransaction(IDbContextTransaction tx, DbContext context)
            {
                _tx = tx;
                _context = context;
            }

            public async Task CommitAsync()
            {
                await _context.SaveChangesAsync();
                await _tx.CommitAsync();
            }

            public async Task RollbackAsync()
            {
                await _tx.RollbackAsync();
            }

            public async ValueTask DisposeAsync()
            {
                await _tx.DisposeAsync();
            }
        }
    }
}

