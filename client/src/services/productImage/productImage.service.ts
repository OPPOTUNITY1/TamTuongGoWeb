import ProductImageServiceGenerated from "../generated/productImage.generate";

class ProductImageService extends ProductImageServiceGenerated {
  private static _instance: ProductImageService;

  public static get instance(): ProductImageService {
    if (!ProductImageService._instance) {
      ProductImageService._instance = new ProductImageService();
    }
    return ProductImageService._instance;
  }
}

const productImageService = ProductImageService.instance;
export default productImageService;
