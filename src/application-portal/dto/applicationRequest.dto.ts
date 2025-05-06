import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateApplicationRequest {
  senderID: string;
  @IsNotEmpty({ message: 'Ghi chú là bắt buộc' })
  senderNote: string;
  senderFileUrl?: string;
}

export class StaffReviewApplicationRequest {
  applicationID: number;
  staffID: number;
  staffNote: string;
  staffFileUrl: string;
  status: string;
}