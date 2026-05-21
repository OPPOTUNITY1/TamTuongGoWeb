using Dapper;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Text;

namespace TamTuong.Model
{
    public class DapperContext
    {
        private readonly string _connectionString;
        public DapperContext(string connectionString)
        {
            _connectionString = connectionString;

        }

        public IDbConnection CreateConnection() => new SqlConnection(_connectionString);


        public async Task<IEnumerable<T>> QueryData<T>(string query)
        {
            try
            {
                using (var connection = CreateConnection())
                {
                    return await connection.QueryAsync<T>(query);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<T> Count<T>(string query)
        {
            try
            {
                using (var connection = CreateConnection())
                {
                    return await connection.ExecuteScalarAsync<T>(query);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
