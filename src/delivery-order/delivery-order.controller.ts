import { Controller } from '@nestjs/common';
import { DeliveryOrderService } from './delivery-order.service';

@Controller('delivery-order')
export class DeliveryOrderController {
  constructor(private readonly deliveryOrderService: DeliveryOrderService) {}
}
