import { BadRequestException, Injectable, ParseUUIDPipe } from '@nestjs/common';
import { CreateDeliveryRequest } from './dto/deliveryRequest.dto';
import {
  DeliveryOrder,
  PrismaClient,
  delivery_status,
  Customer,
} from '@prisma/client';
import { AccountService } from '../account/account.service';
import { PaginationParams } from '../common/utils/response.dto';

@Injectable()
export class DeliveryOrderService {
  private readonly prismaClient;

  constructor(private readonly accountService: AccountService) {
    this.prismaClient = new PrismaClient();
  }

  //waypoint, deliveryCompanyID null :D
  //Create Delivery
  async createDeliveryOrder(
    order: CreateDeliveryRequest,
    accountID: string,
  ): Promise<number> {
    const {
      orderName,
      orderWeight,
      orderImage,
      payloadNote,
      dropDownLatitude,
      dropDownLongtitude,
      dropDownLocation,
    } = order;

    const customer: Customer | null =
      await this.accountService.findCustomerByAccountID(accountID);
    if (!customer) throw new BadRequestException('Customer not found');

    const customerID = customer.customerID;

    //POINT(long lat)
    const dropDownGeoLocation = `POINT(${dropDownLongtitude} ${dropDownLatitude})`;
    const result = await this.prismaClient.$executeRaw`
      INSERT INTO "DeliveryOrder" ("customerID", "waypointID", "orderName", "orderImage", "orderWeight",
                                   "dropDownGeoLocation",
                                   "dropDownLocation", "deliveryCompanyID", "driverID", "status",
                                   "pickUpImage", "dropDownImage", "payloadNote", "createdAt", "updatedAt")
      VALUES (${customerID}::uuid,
              null,
              ${orderName},
              ${orderImage},
              ${orderWeight},
              ST_GeomFromText(${dropDownGeoLocation}, 4326),
              ${dropDownLocation},
              null,
              null,
              ${delivery_status.reject}::delivery_status,
              null,
              null,
              ${payloadNote},
              NOW(),
              null) RETURNING *;
    `;
    return result;
  }

  async viewAllDeliveryOrder(
    accountID: string,
    pagination: PaginationParams = { page: 1, limit: 10 },
    status: delivery_status,
  ): Promise<{
    data: DeliveryOrder[];
    total: number;
  }> {
    const customer: Customer | null =
      await this.accountService.findCustomerByAccountID(accountID);
    if (!customer) throw new BadRequestException('Customer not found');
    const customerID = customer.customerID;

    const { page, limit } = pagination;
    const skipNumber = (page - 1) * limit;

    const where = {
      customerID,
      status,
    };

    const [deliveryOrders, total] = await Promise.all([
      this.prismaClient.deliveryOrder.findMany({
        where,
        skip: skipNumber,
        take: pagination?.limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prismaClient.deliveryOrder.count({
        where,
      }),
    ]);

    return {
      data: deliveryOrders,
      total,
    };
  }
}
