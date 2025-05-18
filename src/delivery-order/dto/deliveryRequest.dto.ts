import { IsDecimal, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

// Vĩ độ (Latitude): N->S , Kinh độ(Longitude): E->W
export class CreateDeliveryRequest {

  @IsString()
  orderName: string;

  @IsOptional()
  @IsString()
  payloadNote?: string

  @IsOptional()
  @IsString()
  orderImage?: string

  @IsNumber({}, { message: 'orderWeight must be a number' })
  orderWeight: number;

  @IsString()
  dropDownLatitude: string;

  @IsString()
  dropDownLongtitude: string;

  @IsString()
  dropDownLocation: string;

}