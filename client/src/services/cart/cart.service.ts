import CartServiceGenerated from "../generated/cart.generated";

class CartService extends CartServiceGenerated {
  private static _instance: CartService;
  public static get instance(): CartService {
    if (!CartService._instance) CartService._instance = new CartService();
    return CartService._instance;
  }
}

const cartService = CartService.instance;
export default cartService;