import { Company, Coordinator, Customer } from "@prisma/client";
import { AuthResponseDto } from "../dto/authResponse.dto";

export interface Account {
    accountID: string;
    email: string;
    password: string;
    status?: string | null; // optional, defaults to "active"
    createdAt?: Date | null; // optional, default is current timestamp
    updatedAt?: Date | null; // optional, default is current timestamp
    Company?: Company; // optional relationship
    Coordinator?: Coordinator; // optional relationship
    Customer?: Customer; // optional relationship
}

//Mapper
export class AccountMapper {
    static toAuthResponseDto(account: Account): AuthResponseDto {
        return {
            accountID: account.accountID,
            email: account.email,
            status: account.status
        };
    }
} 