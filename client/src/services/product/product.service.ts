import ProductServiceGenerated from "../generated/product.generated";

class ProductService extends ProductServiceGenerated {
  private static _instance: ProductService;

  public static get instance(): ProductService {
    if (!ProductService._instance) {
      ProductService._instance = new ProductService();
    }
    return ProductService._instance;
  }
}

const productService = ProductService.instance;
export default productService;
