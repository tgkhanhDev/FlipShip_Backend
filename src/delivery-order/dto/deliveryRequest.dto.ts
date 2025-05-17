import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateDeliveryRequest {

  @IsString()
  orderName: string;

  dropDownGeoLocation: any

  dropDownLocation: string;

  deliveryCompanyID: string;

  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string
}