import { BadRequestException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaPostgresService } from '../prisma/prisma.service';
import { Route, Waypoint } from '@prisma/client';
import { CreateRouteRequest, CreateWaypointRequest, UpdateWaypointRequest } from './dto/routeRequest.dto';
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
      include: {
        Waypoint: true,
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
      include: {
        Waypoint: true,
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
        orderBy: {
          createdAt: 'desc',
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
    driverID: string,
    waypoints: CreateWaypointRequest[],
    coordinatorAccountID: string //from Token
  ): Promise<Route | any> {
    // Validate input
    if (waypoints.length < 2) {
      throw new HttpException(
        'Route must have at least 2 waypoints',
        HttpStatus.BAD_REQUEST
      );
    }

    // Validate coordinator
    const coordinator = await this.accountService.findCoordinatorByAccountID(coordinatorAccountID);
    if (!coordinator) {
      throw new BadRequestException('Điều phối viên không tồn tại');
    }

    // Validate driver if provided
    if (driverID) {
      const driver = await this.accountService.findDriverByDriverID(driverID);
      if (!driver) {
        throw new BadRequestException('Tài xế không tồn tại');
      }
    }

    // Validate waypoints
    const indexSet = new Set();
    for (const waypoint of waypoints) {
      if (indexSet.has(waypoint.index)) {
        throw new BadRequestException('Waypoint index must be unique');
      }
      indexSet.add(waypoint.index);
      if (!this.isValidCoordinate(waypoint.locationLatitude, waypoint.locationLongtitude)) {
        throw new BadRequestException('Invalid coordinates provided');
      }
      if (waypoint.index < 1) {
        throw new BadRequestException('Waypoint index must be at least 1');
      }
    }

    //create route
    const route = await this.repository.route.create({
      data: {
        assignedBy: coordinator.coordinatorID,
        ...(driverID && {
          driverID: driverID,
        }),
      }
    });

    //create waypoints
    for (const waypoint of waypoints) {
      await this.createWaypoint({
        ...waypoint,
      }, route.routeID
      );
    }

    return route;
  }

// Helper method to validate coordinates
  private isValidCoordinate(latitude: string, longitude: string): boolean {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    return (
      !isNaN(lat) &&
      !isNaN(lon) &&
      lat >= -90 &&
      lat <= 90 &&
      lon >= -180 &&
      lon <= 180
    );
  }

  async createWaypoint(request: CreateWaypointRequest, routeID: string): Promise<Waypoint> {
    const query = `
    INSERT INTO "Waypoint" (
      "waypointID",
      "routeID",
      "geoLocation",
      "location",
      "createdAt",
      "updatedAt",
      "index"
    )
    VALUES (
      uuid_generate_v4(),
      $1::uuid,
      ST_GeomFromText($2, 4326),
      $3,
      NOW(),
      NOW(),
      $4
    )
    RETURNING 
        "waypointID",
        "routeID",
        ST_AsText("geoLocation") AS "geoLocation",
        "location",
        "createdAt",
        "updatedAt",
        "index"
  `;
    const result: any[] = await this.repository.$queryRawUnsafe(query,
      routeID, // $1: routeID
      `POINT(${request.locationLongtitude} ${request.locationLatitude})`, // $2: geoLocation
      request.locationName, // $3: location
      request.index // $4: index
    );
    return result[0];
  }

  async updateWaypoint(request: UpdateWaypointRequest, waypointID: string): Promise<Waypoint> {
    const waypoint = await this.repository.waypoint.findUnique({
      where: {
        waypointID: waypointID,
      },
    });
    if (!waypoint) {
      throw new HttpException('Waypoint not found', HttpStatus.NOT_FOUND);
    }

    if (!this.isValidCoordinate(request.locationLatitude, request.locationLongtitude)) {
      throw new BadRequestException('Invalid coordinates provided');
    }

    const query = `
    UPDATE "Waypoint"
    SET
      "geoLocation" = ST_GeomFromText($1, 4326),
      "location" = $2,
      "index" = $3
    WHERE "waypointID" = $4::uuid
    RETURNING 
        "waypointID",
        "routeID",
        ST_AsText("geoLocation") AS "geoLocation",
        "location",
        "createdAt",
        "updatedAt",
        "index"
  `;
    const result: any[] = await this.repository.$queryRawUnsafe(query,
      `POINT(${request.locationLongtitude} ${request.locationLatitude})`, // $1: geoLocation
      request.locationName, // $2: location
      request.index, // $3: index
      waypointID // $4: waypointID
    );
    return result[0];
  }
}
