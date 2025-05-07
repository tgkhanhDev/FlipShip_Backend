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

  private readonly ALLOWED_MIME_TYPES = [
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  ];
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  constructor(
    private readonly s3Service: S3Service,
    private readonly jwtService: JwtUtilsService
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) {
      throw new AppException(ErrorCode.FILE_INVALID);
    } else if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Chỉ sử dụng file có định dạng sau: .xls, .xlsx');
    } else if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException('Kích thước file phải nhỏ hơn 5MB');
    }


    const payload = await this.jwtService.extractAndDecodeToken(req);
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
