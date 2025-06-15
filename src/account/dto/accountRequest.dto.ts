import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateAccountRequest {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}

export class CreateCustomerAccountRequest extends CreateAccountRequest {
  @IsString()
  fullName: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  address: string;
}

export class CreateDriverAccountRequest extends CreateAccountRequest {
  // @IsString()
  // companyName: string
  @IsString()
  liscenseNumber: string;

  @IsString()
  vehicleType: string;

  @IsDate()
  @Type(() => Date)
  licenseExpirationDate: Date;

  @IsString()
  phoneNumber: string;

  @IsUUID()
  companyID: string;

  @IsString()
  licenseLevel: string;

  @IsString()
  fullName: string;

  @IsString()
  identityNumber: string;
}
