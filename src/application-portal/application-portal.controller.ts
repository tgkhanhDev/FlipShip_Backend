import {
  BadRequestException,
  Body,
  Controller, Get,
  HttpCode,
  HttpStatus,
  Post, Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApplicationPortalService } from './application-portal.service';
import { S3Service } from '../thirdParty/s3/s3.service';
import { CreateApplicationRequest, ViewApplicationRequestQuery } from './dto/applicationRequest.dto';
import { ApiResponse } from '../common/utils/response.dto';
import { Application } from '@prisma/client';
import { AccountResponse } from '../account/dto/accountResponse.dto';
import { Request } from 'express';
import { JwtUtilsService } from '../auth/jwtUtils.service';
import { ErrorCode } from '../exception/errorCode.dto';
import { AppException } from '../exception/app.exception';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationResponse } from './dto/applicationResponse.dto';

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

  @Get("/sent-application")
    async viewSenderApplicationRequest(@Query() query: ViewApplicationRequestQuery, @Req() req: Request): Promise<ApiResponse<{applications: ApplicationResponse[];
    total: number;
    page: number;
    limit: number;
  }>> {
    const { applicationStatus } = query;

    const payload = await this.jwtService.extractAndDecodeToken(req);
    const senderID = payload.sub;

    return ApiResponse.build<{
      applications: ApplicationResponse[];
      total: number;
      page: number;
      limit: number;
    }>(
      HttpStatus.CREATED,
      await this.applicationPortalService.viewSenderApplicationRequests(senderID, applicationStatus),
    'Tạo mô tài khoản thành công',
    );
  }

}
