import { Module } from '@nestjs/common';
import { ApplicationPortalService } from './application-portal.service';
import { ApplicationPortalController } from './application-portal.controller';
import { S3Service } from '../thirdParty/s3/s3.service';
import { JwtUtilsService } from '../auth/jwtUtils.service';

@Module({
  controllers: [ApplicationPortalController],
  providers: [ApplicationPortalService, S3Service, JwtUtilsService],
})
export class ApplicationPortalModule {}
