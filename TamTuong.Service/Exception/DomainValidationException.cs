using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

namespace TamTuong.Service.Exception
{
    public class DomainValidationException : System.Exception
    {
        public string ErrorCode { get; }        
        public object? ErrorData { get; }
        public DomainValidationException(string message, string errorCode = "VALIDATION_ERROR", object? errorData = null)
        : base(message)
        {
            ErrorCode = errorCode;
            ErrorData = errorData;
        }
    }
    public class LoginValidationException : DomainValidationException
    {
        public LoginValidationException(string message, string errorCode = "LOGIN_VALIDATION_ERROR", object? errorData = null)
            : base(message, errorCode, errorData)
        {
        }
    }
}
