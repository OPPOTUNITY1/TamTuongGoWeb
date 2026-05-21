using System;
using System.Collections.Generic;
using System.Text;

namespace TamTuong.Service.OrderItemService.Request
{
    public class OrderItemRequest
    {
        public Guid? Id { get; set; }
        public Guid? ShopId { get; set; }
        public Guid? OrderId { get; set; }
        public Guid? ProductId { get; set; }
        public int? Quantity { get; set; }
        public float? UnitPrice { get; set; }
    }
}
