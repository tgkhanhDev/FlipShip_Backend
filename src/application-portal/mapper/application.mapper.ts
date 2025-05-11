import { Account, Application, Staff } from '@prisma/client';
import { ApplicationResponse } from '../dto/applicationResponse.dto';

type ApplicationWithRelations = Application & {
  Account: Account;
  Staff: Staff | null;
};

export class ApplicationMapper {
  static toApplicationResponse(application: ApplicationWithRelations): ApplicationResponse {
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
      Account: application.Account,
      Staff: application.Staff,
      status: application.status,
      type: application.type
    };
  }
}
