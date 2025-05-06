import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApplicationPortalService } from './application-portal.service';
import { S3Service } from '../thirdParty/s3/s3.service';
import { CreateApplicationRequest } from './dto/applicationRequest.dto';
import { ApiResponse } from '../common/utils/response.dto';
import { Application } from '@prisma/client';
import { AccountResponse } from '../account/dto/accountResponse.dto';
import { Request } from 'express';
import { JwtUtilsService } from '../auth/jwtUtils.service';
import { ErrorCode } from '../exception/errorCode.dto';
import { AppException } from '../exception/app.exception';

@Controller('service')
export class ApplicationPortalController {

  constructor(
    private readonly applicationPortalService: ApplicationPortalService,
    private readonly s3Service: S3Service,
    private readonly jwtService: JwtUtilsService
  ) {}

  @Post('/application')
  @HttpCode(HttpStatus.CREATED)
  async createApplication(
    @Body() createApplicationDto: CreateApplicationRequest,
    @Req() req: Request
  ): Promise<ApiResponse<any>> {

    //extract token
    if(req.headers.authorization === undefined) {
      throw new AppException(ErrorCode.AUTH_INVALID);
    }
    const token = req.headers.authorization.replace('Bearer ', "");
    const payload = await this.jwtService.decodeToken(token)
    //set sender ID:
    console.log("payload: ", payload);
    createApplicationDto.senderID = payload.sub

    const app = await this.applicationPortalService.createApplication(createApplicationDto);
    return ApiResponse.build<any>(
      HttpStatus.CREATED,
      app,
      'Tạo mô tài khoản thành công',
    );
  }
}
