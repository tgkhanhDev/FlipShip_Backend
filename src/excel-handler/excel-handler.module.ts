import { Module } from '@nestjs/common';
import { ExcelHandlerService } from './excel-handler.service';
import { ExcelHandlerController } from './excel-handler.controller';
import { S3Service } from '../thirdParty/s3/s3.service';

@Module({
  controllers: [ExcelHandlerController],
  providers: [ExcelHandlerService, S3Service],
})
export class ExcelHandlerModule {}
