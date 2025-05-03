import { Company, Coordinator, Customer, Account } from "@prisma/client";
import { AccountResponse } from '../dto/accountResponse.dto';

//Mapper
export class AccountMapper {
  static toAccountResponse(account: Account): AccountResponse {
    return {
      accountID: account.accountID,
      email: account.email,
      status: account.status
    };
  }
}