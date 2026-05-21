import SellerServiceGenerated from "../generated/seller.generated";

class SellerService extends SellerServiceGenerated {
  private static _instance: SellerService;
  public static get instance(): SellerService {
    if (!SellerService._instance) SellerService._instance = new SellerService();
    return SellerService._instance;
  }
}

const sellerService = SellerService.instance;
export default sellerService;
