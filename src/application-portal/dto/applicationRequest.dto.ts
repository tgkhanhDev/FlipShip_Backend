import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApplicationStatus, ApplicationType } from '@prisma/client';

export class CreateApplicationRequest {
  senderID: string; //Kh cần truyền ở controller
  @IsNotEmpty({ message: 'Ghi chú là bắt buộc' })
  senderNote: string;
  senderFileUrl?: string;
  @IsEnum(ApplicationType, {
    message: 'applicationType must be one of REQUEST_DRIVERS_ACCOUNT, OTHER',
  })
  type: ApplicationType;
}

export class StaffReviewApplicationRequest {
  @IsUUID('4', { message: 'applicationID must be a valid UUID' })
  applicationID: string;

  @IsString({ message: 'staffNote must be a string' })
  staffNote: string;

  @IsEnum(ApplicationStatus, {
    message: 'Trạng thái đơn phải thuộc: APPROVED, REJECTED',
  })
  applicationStatus: ApplicationStatus;

  @IsString({ message: 'staffFileUrl must be a string' })
  @IsOptional()
  staffFileUrl?: string;
}

export class ApproveDriverRequestApplicationRequest {
  @IsUUID('4', { message: 'applicationID must be a valid UUID' })
  applicationID: string;

  @IsString({ message: 'staffNote must be a string' })
  staffNote: string;

  @IsUUID('4', { message: 'companyID must be a valid UUID' })
  companyID: string;
}

//Queries
export class ViewApplicationRequestQuery {
  @IsOptional()
  @IsEnum(ApplicationStatus, {
    message: 'applicationStatus must be one of PENDING, APPROVED, REJECTED',
  })
  applicationStatus: ApplicationStatus;

  @IsOptional()
  page: number = 1; // Default to page 1

  @IsOptional()
  limit: number = 10; // Default to 10 items per page
}

export class ViewReviewableApplicationRequestQuery {
  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  page: number = 1; // Default to page 1

  @IsOptional()
  limit: number = 10; // Default to 10 items per page
}
