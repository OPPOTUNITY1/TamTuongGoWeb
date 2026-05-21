using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Service.Dto;

namespace TamTuong.Service.CartService.Request
{
    public class CartSearch : SearchBase
    {
            public Guid? UserId { get; set; }
            public Guid? ProductId { get; set; }
    }
}
