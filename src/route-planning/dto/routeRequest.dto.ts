import { IsDate, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';
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
  @IsNotEmpty({ message: 'Location Latitude is required' })
  locationLatitude: string;

  @IsString()
  @IsNotEmpty({ message: 'Location Longtitude is required' })
  locationLongtitude: string;

  @IsString()
  @IsNotEmpty({ message: 'Location Name is required' })
  locationName: string;

  @IsInt()
  @IsNotEmpty({ message: 'Index is required' })
  @Min(1, { message: 'Index must be at least 1' })
  index: number
}

export class UpdateWaypointRequest extends CreateWaypointRequest {}


//Query
export class ViewRouteRequestQuery {
  @IsOptional()
  page: number = 1; // Default to page 1

  @IsOptional()
  limit: number = 10; // Default to 10 items per page
}
