import {
  BadRequestException,
  Body,
  Param,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApplicationPortalService } from './application-portal.service';
import { S3Service } from '../thirdParty/s3/s3.service';
import {
  CreateApplicationRequest, StaffReviewApplicationRequest,
  ViewApplicationRequestQuery,
  ViewReviewableApplicationRequestQuery,
} from './dto/applicationRequest.dto';
import {
  ApiResponse,
  PaginationParams,
  PaginationResponse,
} from '../common/utils/response.dto';
import { Account, Application, ApplicationStatus, Role } from '@prisma/client';
import { AccountResponse } from '../account/dto/accountResponse.dto';
import { Request } from 'express';
import { JwtUtilsService } from '../auth/jwtUtils.service';
import { ErrorCode } from '../exception/errorCode.dto';
import { AppException } from '../exception/app.exception';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationResponse } from './dto/applicationResponse.dto';
import { RoleMatch } from '../common/utils/metadata';
import { ValidationPipe } from '../validators/validation.pipe';

@Controller('service')
export class ApplicationPortalController {
  private readonly ALLOWED_MIME_TYPES = [
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  ];
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  constructor(
    private readonly applicationPortalService: ApplicationPortalService,
    private readonly s3Service: S3Service,
    private readonly jwtService: JwtUtilsService,
  ) {}

  @Post('/application')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('senderFile'))
  async createApplication(
    @Body('senderNote') senderNote: string,
    @UploadedFile() senderFile: Express.Multer.File,
    @Req() req: Request,
  ): Promise<ApiResponse<any>> {
    if (!senderNote || senderNote.trim() === '') {
      throw new BadRequestException('Ghi chú là bắt buộc');
    }

    const payload = await this.jwtService.extractAndDecodeToken(req);
    //set sender ID & file Url:
    const createApplicationDto = new CreateApplicationRequest();
    createApplicationDto.senderID = payload.sub;
    createApplicationDto.senderNote = senderNote;

    if (senderFile) {
      if (!this.ALLOWED_MIME_TYPES.includes(senderFile.mimetype)) {
        throw new BadRequestException(
          'Chỉ sử dụng file có định dạng sau: .xls, .xlsx',
        );
      } else if (senderFile.size > this.MAX_FILE_SIZE) {
        throw new BadRequestException('Kích thước file phải nhỏ hơn 5MB');
      }

      const key = `${Date.now()}-${payload.sub}.xlsx`;

      const url = await this.s3Service.uploadFile(
        key,
        senderFile.buffer,
        senderFile.mimetype,
      );
      createApplicationDto.senderFileUrl = url;
    }

    const app =
      await this.applicationPortalService.createApplication(
        createApplicationDto,
      );
    return ApiResponse.build<any>(
      HttpStatus.CREATED,
      app,
      'Tạo mô tài khoản thành công',
    );
  }

  @Get('/sent-application')
  async viewSenderApplicationRequest(
    @Query() query: ViewApplicationRequestQuery,
    @Req() req: Request,
  ): Promise<PaginationResponse<ApplicationResponse[]>> {
    const { applicationStatus, page, limit } = query;

    const payload = await this.jwtService.extractAndDecodeToken(req);
    const senderID = payload.sub;

    const pagiParam: PaginationParams = {
      page: parseInt(page + '') || 1,
      limit: parseInt(limit + '') || 10,
    };

    const response =
      await this.applicationPortalService.viewSenderApplicationRequests(
        senderID,
        applicationStatus,
        pagiParam,
      );

    return PaginationResponse.build<ApplicationResponse[]>(
      HttpStatus.CREATED,
      response.data,
      'Tạo mô tài khoản thành công',
      page,
      response.total,
      limit,
    );
  }

  @Get('/reviewable-application')
  @RoleMatch(Role.Admin, Role.Staff)
  async viewReviewableApplication(
    @Query() query: ViewReviewableApplicationRequestQuery,
    @Req() req: Request,
  ): Promise<PaginationResponse<ApplicationResponse[]>> {
    const { email, page, limit } = query;

    // const payload = await this.jwtService.extractAndDecodeToken(req);
    // const senderID = payload.sub;

    const pagiParam: PaginationParams = {
      page: parseInt(page + '') || 1,
      limit: parseInt(limit + '') || 10,
    };

    const response =
      await this.applicationPortalService.viewReviewableApplicationRequests(
        email,
        pagiParam,
      );

    return PaginationResponse.build<ApplicationResponse[]>(
      HttpStatus.CREATED,
      response.data,
      'Tạo mô tài khoản thành công',
      pagiParam.page,
      response.total,
      pagiParam.limit,
    );
  }

  @Post('/reviewable-application')
  @RoleMatch(Role.Admin, Role.Staff)
  @UseInterceptors(FileInterceptor('senderFile'))
  async addReviewToApplication(
    @Req() req: Request,
    @Body(ValidationPipe) review: StaffReviewApplicationRequest,
    @UploadedFile() senderFile?: Express.Multer.File,
  ): Promise<ApiResponse<ApplicationResponse>> {
    if (!review.staffNote || review.staffNote.trim() === '') {
      throw new BadRequestException('Ghi chú là bắt buộc');
    } else if (review.applicationStatus == ApplicationStatus.PENDING){
      throw new BadRequestException("Trạng thái đơn phải thuộc: APPROVED, REJECTED");
    }
    const payload = await this.jwtService.extractAndDecodeToken(req);

    const senderId = payload.sub;
    return ApiResponse.build<ApplicationResponse>(
      HttpStatus.OK,
      await this.applicationPortalService.addReviewToApplication(review, senderId),
      'Review đơn thành công'
    );
  }

  @Get('/reviewed-application')
  @RoleMatch(Role.Admin, Role.Staff)
  async viewReviewedApplication(
    @Query() query: ViewReviewableApplicationRequestQuery,
    @Req() req: Request,
  ): Promise<PaginationResponse<ApplicationResponse[]>> {
    const { email, page, limit } = query;

    const pagiParam: PaginationParams = {
      page: parseInt(page + '') || 1,
      limit: parseInt(limit + '') || 10,
    };

    const payload = await this.jwtService.extractAndDecodeToken(req);

    const response =
      await this.applicationPortalService.viewReviewedApplication(
        email,
        pagiParam,
        payload.sub
      );

    return PaginationResponse.build<ApplicationResponse[]>(
      HttpStatus.CREATED,
      response.data,
      'Coi lịch sử review thành công',
      pagiParam.page,
      response.total,
      pagiParam.limit,
    );
  }


  //!STEP Này nên thêm vào DB để save lại (qh với bản application)
  @Post('approve-driver-account/:applicationID')
  @RoleMatch(Role.Admin, Role.Staff)
  async registerDriversForApplication(@Param('applicationID') applicationID: string): Promise<Account[]> {
    return this.applicationPortalService.registerDriversForApplication(applicationID);
  }
}
