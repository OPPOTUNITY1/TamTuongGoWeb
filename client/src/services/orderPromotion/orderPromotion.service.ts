import OrderPromotionServiceGenerated from "../generated/orderPromotion.generated";

class OrderPromotionService extends OrderPromotionServiceGenerated {
  private static _instance: OrderPromotionService;
  public static get instance(): OrderPromotionService {
    if (!OrderPromotionService._instance) OrderPromotionService._instance = new OrderPromotionService();
    return OrderPromotionService._instance;
  }
}

const orderPromotionService = OrderPromotionService.instance;
export default orderPromotionService;
