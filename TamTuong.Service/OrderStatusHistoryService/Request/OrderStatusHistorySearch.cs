using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Service.Dto;

namespace TamTuong.Service.OrderStatusHistoryService.Request
{
    public class OrderStatusHistorySearch : SearchBase
    {
        public Guid? OrderId { get; set; }
        public string? Status { get; set; }
    }
}
