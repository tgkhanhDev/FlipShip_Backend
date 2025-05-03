import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post, Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { S3Service } from './s3.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response, Request } from 'express';
import { AppException } from '../../exception/app.exception';
import { ErrorCode } from '../../exception/errorCode.dto';
import { ApiResponse } from '../../common/utils/response.dto';
import { JwtUtilsService } from '../../auth/jwtUtils.service';

@Controller('file/v1')
export class S3Controller {
  constructor(
    private readonly s3Service: S3Service,
    private readonly jwtService: JwtUtilsService
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) {
      throw new AppException(ErrorCode.FILE_INVALID);
    }

    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    // if (!allowedTypes.includes(file.mimetype)) {
    //   throw new BadRequestException('Chỉ sử dụng file có định dạng sau: .xls, .xlsx');
    // }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Kích thước file phải nhỏ hơn 5MB');
    }

    //extract token
    if(req.headers.authorization === undefined) {
      throw new AppException(ErrorCode.AUTH_INVALID);
    }
    const token = req.headers.authorization.replace('Bearer ', "");
    const payload = await this.jwtService.decodeToken(token)

    const key = `${Date.now()}-${payload.sub}.xlsx`;

    const url = await this.s3Service.uploadFile(
      key,
      file.buffer,
      file.mimetype,
    );

    return ApiResponse.build<string>(HttpStatus.CREATED, url, "File uploaded successfully");
  }

  @Get(':key')
  async downloadFile(@Param('key') key: string, @Res() res: Response) {
    try {
      const fileStream = await this.s3Service.downloadFile(key);

      res.set({
        'Content-Disposition': `attachment; filename="${key}"`,
        'Content-Type': 'application/octet-stream',
      });

      fileStream.pipe(res);
    } catch (error) {
      throw new AppException(ErrorCode.FILE_INVALID);
    }
  }
}
