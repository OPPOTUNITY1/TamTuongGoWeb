using System;
using System.Collections.Generic;
using System.Text;

namespace TamTuong.Service.CartService.Request
{
    public class CartRequest
    {
        public Guid? Id { get; set; }
        public Guid UserId { get; set; }
        public Guid ProductId { get; set; }
        public int Quantity { get; set; }
    }
}
