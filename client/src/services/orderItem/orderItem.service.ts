import OrderItemServiceGenerated from "../generated/orderItem.generated";

class OrderItemService extends OrderItemServiceGenerated {
  private static _instance: OrderItemService;
  public static get instance(): OrderItemService {
    if (!OrderItemService._instance) OrderItemService._instance = new OrderItemService();
    return OrderItemService._instance;
  }
}

const orderItemService = OrderItemService.instance;
export default orderItemService;
