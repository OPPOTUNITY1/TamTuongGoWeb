using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Service.Dto;

namespace TamTuong.Service.OrderService.Request
{
    public class OrderSearch : SearchBase
    {
        public Guid? UserId { get; set; }
        public Guid? UserInformationId { get; set; }
        public DateTime? OrderDateFrom { get; set; }
        public DateTime? OrderDateTo { get; set; }
        public string? Status { get; set; }
    }
}
