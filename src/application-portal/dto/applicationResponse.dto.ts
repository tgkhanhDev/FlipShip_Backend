import { ApplicationStatus } from '@prisma/client';

export class ApplicationResponse {
  applicationID: string;
  senderID: string;
  staffID: string | null;
  createdAt: Date | null;
  reviewedAt: Date | null;
  senderNote: string;
  senderFileUrl: string | null;
  staffNote: string | null;
  staffFileUrl: string | null;
  status: ApplicationStatus;
}