import { BadRequestException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaPostgresService } from '../prisma/prisma.service';
import {
  Account,
  Application,
  ApplicationStatus, ApplicationType,
  Role,
  Staff,
} from '@prisma/client';
import {
  CreateApplicationRequest,
  StaffReviewApplicationRequest,
} from './dto/applicationRequest.dto';
import { ApplicationResponse } from './dto/applicationResponse.dto';
import { ApplicationMapper } from './mapper/application.mapper';
import { PaginationParams } from '../common/utils/response.dto';
import { AppException } from '../exception/app.exception';
import { ErrorCode } from '../exception/errorCode.dto';
import { ExcelHandlerService } from '../excel-handler/excel-handler.service';
import { AccountService } from '../account/account.service';
import * as process from 'node:process';
import * as XLSX from 'xlsx';
import { JwtUtilsService } from '../auth/jwtUtils.service';

@Injectable()
export class ApplicationPortalService {
  private readonly applicationRepository;
  private readonly staffRepository;
  private readonly HEADER_ARRAY: string[];

  constructor(
    private readonly repository: PrismaPostgresService,
    private readonly excelHandlerService: ExcelHandlerService,
    private readonly jwtService: JwtUtilsService,
    private readonly accountService: AccountService,
  ) {
    this.applicationRepository = repository.application;
    this.staffRepository = repository.staff;
    this.HEADER_ARRAY = process.env.EXCEL_HEADER_VALIDATION_ARRAY!.split(',');
  }

  async createApplication(
    createApplicationDto: CreateApplicationRequest,
  ): Promise<Application> {
    return this.applicationRepository.create({
      data: {
        senderID: createApplicationDto.senderID,
        senderNote: createApplicationDto.senderNote,
        senderFileUrl: createApplicationDto.senderFileUrl,
        reviewedAt: null,
        type: createApplicationDto.type,
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
          orderBy: {
            createdAt: 'desc',
          },
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
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //Staff
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
        staffID: {
          equals: null
        }
      };

      const [applications, total] = await Promise.all([
        this.applicationRepository.findMany({
          where,
          skip: skipNumber,
          take: pagination?.limit,
          orderBy: {
            createdAt: 'asc',
          },
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
                status: true,
              },
            },
            Staff: true,
            type: true
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
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //For Staff to collect/release task
  async selfAssignApplication(
    applicationID: string,
    staffAccountID: string,
    isAssigned: boolean,
  ): Promise<ApplicationResponse> {
    const application: Application =
      await this.applicationRepository.findUnique({
        where: {
          applicationID,
        },
      });
    if (!application) throw new BadRequestException('Đơn không tồn tại');

    const staff: Staff = await this.staffRepository.findUnique({
      where: {
        accountID: staffAccountID,
      },
    });
    if (!staff) throw new BadRequestException('Nhân viên không tồn tại');

    if (application.staffID != null && application.staffID !== staff.staffID)
      throw new BadRequestException('Đơn này có nhân viên khác đảm nhận');
    else if (application.status !== ApplicationStatus.PENDING)
      throw new BadRequestException('Đơn này đã hoàn thành');

    if (isAssigned) {
      const persistedApplication = await this.applicationRepository.update({
        where: {
          applicationID,
        },
        data: {
          status: ApplicationStatus.PENDING,
          Staff: {
            connect: {
              staffID: staff.staffID,
            },
          },
        },
      });
      return ApplicationMapper.toApplicationResponse(persistedApplication);
    } else {
      const persistedApplication = await this.applicationRepository.update({
        where: {
          applicationID,
        },
        data: {
          status: ApplicationStatus.PENDING,
          Staff: {
            disconnect: true,
          },
        },
      });
      return ApplicationMapper.toApplicationResponse(persistedApplication);
    }
  }

  async viewAssignedApplication(
    email: string | null,
    staffAccountID: string,
    pagination: PaginationParams = { page: 1, limit: 10 }, // Default values
  ): Promise<{
    data: ApplicationResponse[];
    total: number;
  }> {
    try {
      const { page, limit } = pagination;
      const skipNumber = (page - 1) * limit;

      const staff = this.staffRepository.findUnique({
        where: {
          accountID: staffAccountID,
        }
      })
      if(!staff) throw new BadRequestException('Nhân viên không tồn tại')

      // Build the where clause
      const where = {
        Account: {
          status: 'active',
          ...(email ? { email: { contains: email, mode: 'insensitive' } } : {}),
        },
        Staff: {
          isNot: null,
          staffID: staff.staffID
        },
        reviewedAt: {
          equals: null
        }
      };

      const [applications, total] = await Promise.all([
        this.applicationRepository.findMany({
          where,
          skip: skipNumber,
          take: pagination?.limit,
          orderBy: {
            createdAt: 'asc',
          },
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
                status: true,
              },
            },
            Staff: true,
            type: true
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
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async addReviewToApplication(
    staffReviewApplicationRequest: StaffReviewApplicationRequest,
    reviewerID: string,
  ): Promise<ApplicationResponse> {
    const { applicationID, applicationStatus, staffFileUrl, staffNote,  } =
      staffReviewApplicationRequest;

    const application: Application =
      await this.applicationRepository.findUnique({
        where: {
          applicationID: staffReviewApplicationRequest.applicationID,
        },
      });

    if (!application) throw new BadRequestException('Đơn không tồn tại');

    const staff: Staff = await this.staffRepository.findUnique({
      where: {
        accountID: reviewerID,
      },
    });
    if (!staff) throw new BadRequestException('Nhân viên không tồn tại');

    //check Type to ensure DRIVER REQUEST MUST HAVE URL
    if (application.type === ApplicationType.REQUEST_DRIVERS_ACCOUNT
      && applicationStatus === ApplicationStatus.APPROVED
      && !staffReviewApplicationRequest.staffFileUrl ) {
      throw new BadRequestException('Đơn yêu cầu tài xế nếu duyệt phải có file');
    }
    try {
      const persistedApplication: any = await this.applicationRepository.update({
        where: {
          applicationID: staffReviewApplicationRequest.applicationID,
        },
        data: {
          status: applicationStatus,
          Staff: {
            connect: {
              staffID: staff.staffID,
            },
          },
          staffNote: staffNote,
          staffFileUrl: staffFileUrl ? staffFileUrl : null,
          reviewedAt: new Date(),
        },
      });

      return ApplicationMapper.toApplicationResponse(persistedApplication);
    } catch (error) {
      Logger.error('Error fetching applications:', error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async viewReviewedApplication(
    email: string | null,
    pagination: PaginationParams = { page: 1, limit: 10 }, // Default values
    staffAccountID: string,
  ): Promise<{
    data: ApplicationResponse[];
    total: number;
  }> {
    try {
      const { page, limit } = pagination;
      const skipNumber = (page - 1) * limit;

      //Check staff validity
      const staff: Staff = await this.staffRepository.findUnique({
        where: {
          accountID: staffAccountID,
        },
      });
      if (!staff) throw new BadRequestException('Nhân viên không tồn tại');

      // Build the where clause
      const where = {
        Account: {
          ...(email ? { email: { contains: email, mode: 'insensitive' } } : {}),
        },
        Staff: {
          accountID: staffAccountID,
        },
        reviewedAt: {
          not: null,
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
                status: true,
              },
            },
            Staff: false,
            type: true
          },
        }),
        this.applicationRepository.count({ where }),
      ]);

      const mappedApplications = applications.map((application) =>
        ApplicationMapper.toApplicationResponse(application),
      );

      return {
        data: mappedApplications,
        total,
      };
    } catch (error) {
      Logger.error('Error fetching applications:', error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async lookupApplicationDrivers(applicationID: string): Promise<Account[]> {
    const application = await this.applicationRepository.findUnique({
      where: { applicationID },
    });

    if (!application) {
      throw new BadRequestException('Đơn không tồn tại');
    } else if (application.type != ApplicationType.REQUEST_DRIVERS_ACCOUNT) {
      throw new BadRequestException('Loại đơn không phải là đơn yêu cầu tài xế');
    }

    const data = await this.excelHandlerService.readExcelFromUrl(
      application.senderFileUrl,
    )

    return data;
  }

  async registerDriversForApplication(
    applicationID: string,
  ): Promise<Account[]> {
    const application = await this.applicationRepository.findUnique({
      where: { applicationID },
    });

    if (!application) {
      throw new BadRequestException('Đơn không tồn tại');
    }

    if (
      application.status === ApplicationStatus.REJECTED ||
      application.status === ApplicationStatus.PENDING
    ) {
      throw new BadRequestException('Trạng thái đơn phải là: APPROVED');
    }

    if (
      !application.senderFileUrl ||
      !(await this.excelHandlerService.validateExcelFile(
        application.senderFileUrl,
      ))
    ) {
      throw new BadRequestException(
        'File không hợp lệ, phải có định dạng xlsx url',
      );
    }

    const data = await this.excelHandlerService.readExcelFromUrl(
      application.senderFileUrl,
    );

    const accountList = await Promise.all(
      data.map(async (item) => {
        const rawDate = item[this.HEADER_ARRAY[5].toString()];
        const generatedRandomPassword = '123456';
        const hashPassword = await this.jwtService.hashPassword(
          generatedRandomPassword,
        );

        //Insert to File to Response to User

        return await this.accountService.createDriverAccount({
          email: item[this.HEADER_ARRAY[1].toString()],
          password: hashPassword,
          liscenseNumber: item[this.HEADER_ARRAY[4].toString()].toString(),
          licenseExpirationDate: new Date(
            XLSX.SSF.format('yyyy-mm-dd', rawDate),
          ),
          vehicleType: item[this.HEADER_ARRAY[6].toString()],
        });
      }),
    );

    return accountList;
  }


}
