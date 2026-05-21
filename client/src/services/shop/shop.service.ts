import ShopServiceGenerated from "../generated/shop.generated";

class ShopService extends ShopServiceGenerated {
  private static _instance: ShopService;
  public static get instance(): ShopService {
    if (!ShopService._instance) ShopService._instance = new ShopService();
    return ShopService._instance;
  }
}

const shopService = ShopService.instance;
export default shopService;
