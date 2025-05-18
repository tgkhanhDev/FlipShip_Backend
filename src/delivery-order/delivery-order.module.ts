import { Module } from '@nestjs/common';
import { DeliveryOrderService } from './delivery-order.service';
import { DeliveryOrderController } from './delivery-order.controller';
import { AccountService } from '../account/account.service';
import { JwtUtilsService } from '../auth/jwtUtils.service';
import { ImageHandlerService } from '../image-handler/image-handler.service';
import { S3Service } from '../thirdParty/s3/s3.service';

@Module({
  controllers: [DeliveryOrderController],
  providers: [DeliveryOrderService, AccountService, JwtUtilsService, ImageHandlerService, S3Service],
})
export class DeliveryOrderModule {}
