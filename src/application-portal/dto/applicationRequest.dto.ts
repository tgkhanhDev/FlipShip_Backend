import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApplicationStatus } from '@prisma/client';

export class CreateApplicationRequest {
  senderID: string; //Kh cần truyền ở controller
  @IsNotEmpty({ message: 'Ghi chú là bắt buộc' })
  senderNote: string;
  senderFileUrl?: string;
}

export class StaffReviewApplicationRequest {
  @IsUUID()
  @IsNotEmpty({ message: 'Mã đơn không được để trống' })
  applicationID: string;
  
  @IsNotEmpty({ message: 'Ghi chú là bắt buộc' })
  staffNote: string;

  staffFileUrl ?: string;

  status: ApplicationStatus;

  //from token
  staffID: number;
}

//Queries
export class ViewApplicationRequestQuery {
  @IsOptional()
  @IsEnum(ApplicationStatus, { message: 'applicationStatus must be one of PENDING, APPROVED, REJECTED' })
  applicationStatus: ApplicationStatus;
}