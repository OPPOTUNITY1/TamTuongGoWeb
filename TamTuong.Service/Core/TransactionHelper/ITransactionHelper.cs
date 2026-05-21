using System;
using System.Collections.Generic;
using System.Data;
using System.Text;

namespace TamTuong.Service.Core.TransactionHelper
{
    public interface ITransactionHelper
    {
        Task<ITransaction> BeginTransactionAsync(IsolationLevel? isolationLevel = null);
    }

    public interface ITransaction : IAsyncDisposable
    {
        Task CommitAsync();
        Task RollbackAsync();
    }
}
