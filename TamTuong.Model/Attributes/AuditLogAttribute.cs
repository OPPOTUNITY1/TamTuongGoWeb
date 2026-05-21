using System;
using System.Collections.Generic;
using System.Text;

namespace TamTuong.Model.Attributes
{
    [AttributeUsage(AttributeTargets.Property)]
    public class AuditLogAttribute : Attribute
    {
        public string DisplayName { get; }
        public string? FieldCode { get; }
        public AuditLogAttribute(string displayName, string? fieldCode = null)
        {
            DisplayName = displayName;
            FieldCode = fieldCode;
        }
    }
}
