import { Application } from '@prisma/client';
import { ApplicationResponse } from '../dto/applicationResponse.dto';

export class ApplicationMapper {
  static toApplicationResponse(application: Application): ApplicationResponse {
    return {
      applicationID: application.applicationID,
      senderID: application.senderID ,
      staffID: application.staffID,
      createdAt: application.createdAt,
      reviewedAt: application.reviewedAt,
      senderNote: application.senderNote,
      senderFileUrl: application.senderFileUrl,
      staffNote: application.staffNote,
      staffFileUrl: application.staffFileUrl,
      status: application.status,
    };
  }
}
