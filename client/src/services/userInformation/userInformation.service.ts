import UserInformationServiceGenerated from "../generated/userInformation.generated";

class UserInformationService extends UserInformationServiceGenerated {
  private static _instance: UserInformationService;

  public static get instance(): UserInformationService {
    if (!UserInformationService._instance) {
      UserInformationService._instance = new UserInformationService();
    }
    return UserInformationService._instance;
  }
}

const userInformationService = UserInformationService.instance;
export default userInformationService;