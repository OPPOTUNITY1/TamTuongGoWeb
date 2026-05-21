import OrderServiceGenerated from "../generated/order.generated";

class OrderService extends OrderServiceGenerated {
  private static _instance: OrderService;
  public static get instance(): OrderService {
    if (!OrderService._instance) OrderService._instance = new OrderService();
    return OrderService._instance;
  }
}

const orderService = OrderService.instance;
export default orderService;
