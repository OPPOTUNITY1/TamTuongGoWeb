import ReviewImageServiceGenerated from "../generated/reviewImage.generated";

class ReviewImageService extends ReviewImageServiceGenerated {
  private static _instance: ReviewImageService;

  public static get instance(): ReviewImageService {
    if (!ReviewImageService._instance) {
      ReviewImageService._instance = new ReviewImageService();
    }
    return ReviewImageService._instance;
  }
}

const reviewImageService = ReviewImageService.instance;
export default reviewImageService;