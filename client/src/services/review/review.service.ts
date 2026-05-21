import ReviewServiceGenerated from "../generated/review.generated";

class ReviewService extends ReviewServiceGenerated {
  private static _instance: ReviewService;

  public static get instance(): ReviewService {
    if (!ReviewService._instance) {
      ReviewService._instance = new ReviewService();
    }
    return ReviewService._instance;
  }
}

const reviewService = ReviewService.instance;
export default reviewService;