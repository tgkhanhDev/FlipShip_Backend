import {
  BadRequestException,
  Body,
  Controller, Get,
  HttpStatus,
  Post, Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { DeliveryOrderService } from './delivery-order.service';
import { CreateDeliveryRequest, ViewDeliveryOrderQuery } from './dto/deliveryRequest.dto';
import { DeliveryOrder, Role } from '@prisma/client';
import { RoleMatch } from '../common/utils/metadata';
import { Request } from 'express';
import { JwtUtilsService } from '../auth/jwtUtils.service';
import { ApiResponse, PaginationParams, PaginationResponse } from '../common/utils/response.dto';
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

  @Get('/created')
  @RoleMatch(Role.Customer)
  async viewAllDeliveryOrder(
    @Query() query: ViewDeliveryOrderQuery,
    @Req() req: Request
  ): Promise<PaginationResponse<DeliveryOrder[]>> {
    const { status, page, limit } = query;
    const payload = await this.jwtService.extractAndDecodeToken(req);
    const accountID = payload.sub;

    const pagiParam: PaginationParams = {
      page: parseInt(page + '') || 1,
      limit: parseInt(limit + '') || 10,
    };

    const response = await this.deliveryOrderService.viewAllDeliveryOrder(accountID, pagiParam, status);

    return PaginationResponse.build<DeliveryOrder[]>(
      HttpStatus.OK,
      response.data,
      'Xem danh sách đơn vận chuyển',
      page,
      response.total,
      limit
    );
  }


}
