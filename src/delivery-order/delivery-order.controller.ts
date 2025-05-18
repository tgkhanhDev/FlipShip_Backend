import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { DeliveryOrderService } from './delivery-order.service';
import { CreateDeliveryRequest } from './dto/deliveryRequest.dto';
import { DeliveryOrder, Role } from '@prisma/client';
import { RoleMatch } from '../common/utils/metadata';
import { Request } from 'express';
import { JwtUtilsService } from '../auth/jwtUtils.service';
import { ApiResponse } from '../common/utils/response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageHandlerService } from '../image-handler/image-handler.service';

@Controller('delivery-order')
export class DeliveryOrderController {
  constructor(
    private readonly deliveryOrderService: DeliveryOrderService,
    private readonly jwtService: JwtUtilsService,
    private readonly imageHandlerService: ImageHandlerService
  ) {}

  //TODO: Customer
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @RoleMatch(Role.Customer)
  async createDeliveryOrder(
    @Req() req: Request,
    @Body('order') orderRaw: string,
    @UploadedFile('file') file?: Express.Multer.File,
  ): Promise<ApiResponse<null>> {
    let order: CreateDeliveryRequest;
    try {
      order = JSON.parse(orderRaw);
    } catch (err) {
      throw new BadRequestException('Invalid JSON in "order" field');
    }

    order.orderImage = file ? await this.imageHandlerService.uploadImage(file) : undefined;

    const payload = await this.jwtService.extractAndDecodeToken(req);
    const deliveryOrder: number = await this.deliveryOrderService.createDeliveryOrder(
      order,
      payload.sub,
    );

    return ApiResponse.build<null>(
      deliveryOrder == 1 ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST,
      null,
      'Tạo đơn vận chuyển thành công',
    );

  }


}
