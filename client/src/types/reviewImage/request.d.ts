export interface ReviewImageRequest {
    id?: string;
    reviewId?: string;
    imageUrl?: string;
    sortOrder?: number;
}
export interface ReviewImageSearch {
    reviewId?: string;
}