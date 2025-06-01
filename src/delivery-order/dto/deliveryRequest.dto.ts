import {
  IsDecimal,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { delivery_status } from '@prisma/client';

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

//Queries
export class ViewDeliveryOrderQuery {
  @IsOptional()
  @IsEnum(delivery_status, {
    message: 'Delivery Status must be one of reject, pending, in_progress, delivered, canceled',
  })
  status: delivery_status;

  @IsOptional()
  page: number = 1; // Default to page 1

  @IsOptional()
  limit: number = 10; // Default to 10 items per page
}