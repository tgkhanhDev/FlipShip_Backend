import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApplicationType } from '@prisma/client';

export class CreateRouteRequest {
  @IsUUID()
  @IsOptional()
  driverID: string

  @IsNotEmpty()
  waypoints: CreateWaypointRequest[]

}

export class CreateWaypointRequest {

  @IsString()
  locationLatitude: string;

  @IsString()
  locationLongtitude: string;

  @IsInt()
  @Min(1, { message: 'Index must be at least 1' })
  index: number

}


//Query
export class ViewRouteRequestQuery {
  @IsOptional()
  page: number = 1; // Default to page 1

  @IsOptional()
  limit: number = 10; // Default to 10 items per page
}