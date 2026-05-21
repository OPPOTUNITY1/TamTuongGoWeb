import OrderStatusHistoryServiceGenerated from "../generated/orderStatusHistory.generated";

class OrderStatusHistoryService extends OrderStatusHistoryServiceGenerated {
  private static _instance: OrderStatusHistoryService;
  public static get instance(): OrderStatusHistoryService {
    if (!OrderStatusHistoryService._instance) OrderStatusHistoryService._instance = new OrderStatusHistoryService();
    return OrderStatusHistoryService._instance;
  }
}

const orderStatusHistoryService = OrderStatusHistoryService.instance;
export default orderStatusHistoryService;