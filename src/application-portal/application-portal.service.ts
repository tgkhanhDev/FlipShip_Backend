import { Injectable, Logger } from '@nestjs/common';
import { PrismaPostgresService } from '../prisma/prisma.service';
import { Application, ApplicationStatus, Role } from '@prisma/client';
import {
  CreateApplicationRequest,
  StaffReviewApplicationRequest,
} from './dto/applicationRequest.dto';
import { ApplicationResponse } from './dto/applicationResponse.dto';
import { ApplicationMapper } from './mapper/application.mapper';
import { PaginationParams } from '../common/utils/response.dto';
import { AppException } from '../exception/app.exception';
import { ErrorCode } from '../exception/errorCode.dto';

@Injectable()
export class ApplicationPortalService {
  private readonly applicationRepository;
  private readonly staffRepository;

  constructor(private readonly repository: PrismaPostgresService) {
    this.applicationRepository = repository.application;
    this.staffRepository = repository.staff;
  }

  async createApplication(
    createApplicationDto: CreateApplicationRequest,
  ): Promise<Application> {
    return this.applicationRepository.create({
      data: {
        senderID: createApplicationDto.senderID,
        senderNote: createApplicationDto.senderNote,
        senderFileUrl: createApplicationDto.senderFileUrl,
      },
    });
  }

  //!Staff
  async viewSenderApplicationRequests(
    senderID: string,
    status: ApplicationStatus | null,
    pagination: PaginationParams = { page: 1, limit: 10 }, // Default values
  ): Promise<{
    applications: ApplicationResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      // Build the where clause
      const where = {
        senderID, // Match schema field name
        ...(status ? { status } : {}),
      };

      // Fetch paginated applications and total count concurrently
      const [applications, total] = await Promise.all([
        this.applicationRepository.findMany({
          where,
          skip: pagination?.page,
          take: pagination?.limit,
          select: {
            applicationID: true,
            senderID: true,
            senderNote: true,
            senderFileUrl: true,
            status: true,
            createdAt: true,
            reviewedAt: true,
            staffID: true,
            staffNote: true,
            staffFileUrl: true,
            Account: { select: { email: true } }, // Use Account relation
            Staff: { select: { email: true } }, // Use Staff relation
          },
        }),
        this.applicationRepository.count({ where }),
      ]);

      // return { applications, total };
      // // Map applications to response DTO
      const mappedApplications = applications.map((application) =>
        ApplicationMapper.toApplicationResponse(application),
      );

      return {
        applications: mappedApplications,
        total,
        page: pagination.page,
        limit: pagination.limit,
      };

    } catch (error) {
      Logger.error('Error fetching applications:', error);
      throw new AppException(ErrorCode.SERVER_ERROR);
    }

  }

}
