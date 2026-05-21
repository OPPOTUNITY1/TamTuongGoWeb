using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Service.Dto;

namespace TamTuong.Service.OrderItemService.Request
{
    public class OrderItemSearch : SearchBase
    {
        public Guid? ShopId { get; set; }
        public Guid? OrderId { get; set; }
        public Guid? ProductId { get; set; }
    }
}
