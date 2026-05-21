using System;
using System.Collections.Generic;
using System.Text;

namespace TamTuong.Service.OrderStatusHistoryService.Request
{
    public class OrderStatusHistoryRequest
    {
        public Guid? Id { get; set; }
        public Guid? OrderId { get; set; }
        public string? Status { get; set; }
        public string? Note { get; set; }
        public bool? SendEmail { get; set; }
    }
}
