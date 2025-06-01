import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaPostgresService } from '../prisma/prisma.service';
import { Route, Waypoint } from '@prisma/client';
import { CreateRouteRequest } from './dto/routeRequest.dto';
import { AccountService } from '../account/account.service';
import { PaginationParams } from '../common/utils/response.dto';

@Injectable()
export class RoutePlanningService {
  private readonly routeRepository;
  private readonly waypointRepository;

  constructor(
    private readonly repository: PrismaPostgresService,
    private readonly accountService: AccountService,
  ) {
    this.routeRepository = repository.route;
    this.waypointRepository = repository.waypoint;
  }

  async findByRouteID(routeID: string): Promise<Route | null> {
    return await this.routeRepository.findUnique({
      where: {
        routeID,
      },
    });
  }

  async findByWayPointID(waypointID: string): Promise<Route | null> {
    const waypoint: Waypoint = await this.waypointRepository.findUnique({
      where: {
        waypointID,
      },
    });
    if (waypoint == null) return null;
    return await this.routeRepository.findUnique({
      where: {
        routeID: waypoint.routeID,
      },
    });
  }

  async findByDriverID(
    driverID: string,
    pagination: PaginationParams = { page: 1, limit: 10 }, // Default values
  ): Promise<{
    data: Route[];
    total: number;
  }> {
    try {
      const { page, limit } = pagination;
      const skipNumber = (page - 1) * limit;

      const routes = await this.routeRepository.findMany({
        where: {
          driverID,
        },
        skip: skipNumber,
        take: limit,
      });

      const total = await this.routeRepository.count({
        where: {
          driverID,
        },
      });

      return {
        data: routes,
        total,
      };
    } catch (error) {
      Logger.error('Error fetching applications:', error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //POST
  //loops waypoints
  async planningRoute(
    request: CreateRouteRequest,
    accountID: string,
  ): Promise<Route | null> {
    const { driverID, waypoints } = request;

    const route = await this.routeRepository.create({
      data: {
        driverID,
        waypoints: {
          createMany: {
            data: waypoints.map((waypoint) => ({
              index: waypoint.index,
              locationLatitude: waypoint.locationLatitude,
              locationLongtitude: waypoint.locationLongtitude,
            })),
          },
        },
      },
    });

    return null;
  }
}
