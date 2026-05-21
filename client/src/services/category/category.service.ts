import CategoryServiceGenerated from "../generated/category.generated";

class CategoryService extends CategoryServiceGenerated {
  private static _instance: CategoryService;
  public static get instance(): CategoryService {
    if (!CategoryService._instance) CategoryService._instance = new CategoryService();
    return CategoryService._instance;
  }
}

const categoryService = CategoryService.instance;
export default categoryService;
