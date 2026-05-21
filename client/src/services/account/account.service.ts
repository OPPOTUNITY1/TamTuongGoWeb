import AccountServiceGenerated from "../generated/account.generated";

class AccountService extends AccountServiceGenerated {
  private static _instance: AccountService;

  public static get instance(): AccountService {
    if (!AccountService._instance) {
      AccountService._instance = new AccountService();
    }
    return AccountService._instance;
  }
}

const accountService = AccountService.instance;
export default accountService;
