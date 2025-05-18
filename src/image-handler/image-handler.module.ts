import { Module } from '@nestjs/common';
import { ImageHandlerService } from './image-handler.service';
import { ImageHandlerController } from './image-handler.controller';
import { S3Service } from '../thirdParty/s3/s3.service';

@Module({
  controllers: [ImageHandlerController],
  providers: [ImageHandlerService, S3Service],
})
export class ImageHandlerModule {}
