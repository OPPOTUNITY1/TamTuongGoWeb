import PromotionServiceGenerated from "../generated/promotion.generated";

class PromotionService extends PromotionServiceGenerated {
  private static _instance: PromotionService;

  public static get instance(): PromotionService {
    if (!PromotionService._instance) {
      PromotionService._instance = new PromotionService();
    }
    return PromotionService._instance;
  }
}

const promotionService = PromotionService.instance;
export default promotionService;
