import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ExcelHandlerService } from './excel-handler.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public, RoleMatch } from 'src/common/utils/metadata';
import { ApiResponse } from '../common/utils/response.dto';
import { S3Service } from '../thirdParty/s3/s3.service';

@Controller('excel-handler')
export class ExcelHandlerController {
  constructor(
    private readonly excelHandlerService: ExcelHandlerService,
    private readonly s3Service: S3Service,
  ) {}

  @Post('/read-excel')
  @Public()
  @UseInterceptors(FileInterceptor('file'))
  async readExcel(
    @UploadedFile('file') file?: Express.Multer.File,
    @Body('fileUrl') fileUrl?: string,
  ): Promise<ApiResponse<any[]>> {
    let data: any[];

    if (file) {
      data = await this.excelHandlerService.readExcelFile(file);
    } else if (fileUrl) {
      if (!(await this.s3Service.validateCloundFontEndpoint(fileUrl)))
        throw new BadRequestException('URL không hợp lệ');
      data = await this.excelHandlerService.readExcelFromUrl(fileUrl);
    } else {
      throw new BadRequestException(
        'Hãy sử dụng file có định dạng .xlsx hoặc URL.',
      );
    }
    return ApiResponse.build<any[]>(
      HttpStatus.OK,
      data,
      'File read successfully',
    );
  }

  @Post('/validate-format')
  @Public()
  @UseInterceptors(FileInterceptor('file'))
  async validateExcelFile(
    @UploadedFile('file') file?: Express.Multer.File,
    @Body('fileUrl') fileUrl?: string,
  ): Promise<ApiResponse<null>> {
    let message = '';
    if (file) {
      message = await this.excelHandlerService.validateExcelFile(file);
    } else if (fileUrl) {

      if (!(await this.s3Service.validateCloundFontEndpoint(fileUrl)))
        throw new BadRequestException('URL không hợp lệ');

      message = await this.excelHandlerService.validateExcelFile(fileUrl);
    } else {
      throw new BadRequestException(
        'Hãy sử dụng file có định dạng .xlsx hoặc URL.',
      );
    }
    return ApiResponse.build<null>(HttpStatus.OK, null, message);
  }

  @Post('/generate-excel')
  @Public()
  async generateExcelFile(@Body() data: Record<string, any>[]){
    return this.excelHandlerService.generateExcelAndUploadToS3(data);
  }
}
