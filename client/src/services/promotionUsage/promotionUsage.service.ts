import PromotionUsageServiceGenerated from "../generated/promotionUsage.generated";

class PromotionUsageService extends PromotionUsageServiceGenerated {
  private static _instance: PromotionUsageService;

  public static get instance(): PromotionUsageService {
    if (!PromotionUsageService._instance) {
      PromotionUsageService._instance = new PromotionUsageService();
    }
    return PromotionUsageService._instance;
  }
}

const promotionUsageService = PromotionUsageService.instance;
export default promotionUsageService;