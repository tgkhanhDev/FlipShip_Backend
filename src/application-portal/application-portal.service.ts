import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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

  //Customer
  async viewSenderApplicationRequests(
    senderID: string,
    status: ApplicationStatus | null,
    pagination: PaginationParams = { page: 1, limit: 10 }, // Default values
  ): Promise<{
    data: ApplicationResponse[];
    total: number;
  }> {
    try {
      const { page, limit } = pagination;
      const skipNumber = (page - 1) * limit;

      // Build the where clause
      const where = {
        senderID, // Match schema field name
        ...(status ? { status } : {}),
      };

      // Fetch paginated applications and total count concurrently
      const [applications, total] = await Promise.all([
        this.applicationRepository.findMany({
          where,
          skip: skipNumber,
          take: pagination?.limit,
          select: {
            applicationID: true,
            senderID: false,
            senderNote: true,
            senderFileUrl: true,
            status: true,
            createdAt: true,
            reviewedAt: true,
            staffID: false,
            staffNote: true,
            staffFileUrl: true,
            Account: {
              select: {
                accountID: true,
                email: true,
                role: true,
              },
            },
            Staff: true,
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
        data: mappedApplications,
        total,
      };
    } catch (error) {
      Logger.error('Error fetching applications:', error);
      throw new AppException(ErrorCode.SERVER_ERROR);
    }
  }

  async viewReviewableApplicationRequests(
    email: string | null,
    pagination: PaginationParams = { page: 1, limit: 10 }, // Default values
  ): Promise<{
    data: ApplicationResponse[];
    total: number;
  }> {
    try {
      const { page, limit } = pagination;
      const skipNumber = (page - 1) * limit;

      // Build the where clause
      const where = {
        Account: {
          status: 'active',
          ...(email ? { email: { contains: email, mode: 'insensitive' } } : {}),
        },
      };

      const [applications, total] = await Promise.all([
        this.applicationRepository.findMany({
          where,
          skip: skipNumber,
          take: pagination?.limit,
          select: {
            applicationID: true,
            senderID: false,
            senderNote: true,
            senderFileUrl: true,
            status: true,
            createdAt: true,
            reviewedAt: true,
            staffID: false,
            staffNote: true,
            staffFileUrl: true,
            Account: {
              select: {
                accountID: true,
                email: true,
                role: true,
                status: true
              },
            },
            Staff: true,
          },
        }),
        this.applicationRepository.count({ where }),
      ]);

      //Map to response DTO
      const mappedApplications = applications.map((application) =>
        ApplicationMapper.toApplicationResponse(application),
      );

      return {
        data: mappedApplications,
        total,
      };
    } catch (error) {
      Logger.error('Error fetching applications:', error);
      throw new AppException(ErrorCode.SERVER_ERROR);
    }
  }

  async addReviewToApplication(
    staffReviewApplicationRequest: StaffReviewApplicationRequest,
    staffID: string
  ): Promise<ApplicationResponse> {

    const {applicationID, applicationStatus, staffFileUrl, staffNote} = staffReviewApplicationRequest

    const application: Application = await this.applicationRepository.findUnique({
      where: {
        applicationID: staffReviewApplicationRequest.applicationID,
      },
    });

    if(!application) throw new BadRequestException("Đơn không tồn tại")

    const persistedApplication: any = await this.applicationRepository.update({
      where: {
        applicationID: staffReviewApplicationRequest.applicationID,
      },
      data: {
        status: applicationStatus,
        staffID: staffID,
        staffNote: staffNote,
        staffFileUrl: staffFileUrl ? staffFileUrl : null,
        reviewedAt: new Date(),
      }
    });

    return ApplicationMapper.toApplicationResponse(persistedApplication);
  }

}
