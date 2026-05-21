export interface UserInformationRequest {
  id?: string;
  userId?: string;
  fullName?: string;
  email?: string;
  streetAddress?: string;
  buildingInfo?: string;
  district?: string;
  ward?: string;
  city?: string;
  phoneNumber?: string;
}
export interface UserInformationSearch {
  userId?: string;
}