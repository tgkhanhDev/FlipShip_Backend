import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Param,
  Query,
  HttpStatus, Patch,
} from '@nestjs/common';
import { RoutePlanningService } from './route-planning.service';
import {
  CreateRouteRequest, CreateWaypointRequest, UpdateWaypointRequest,
  ViewRouteRequestQuery,
} from './dto/routeRequest.dto';
import { Request } from 'express';
import { RoleMatch } from '../common/utils/metadata';
import { Role, Route, Waypoint } from '@prisma/client';
import { Public } from 'src/common/utils/metadata';
import {
  ApiResponse,
  PaginationParams,
  PaginationResponse,
} from '../common/utils/response.dto';
import { ApplicationResponse } from '../application-portal/dto/applicationResponse.dto';
import { JwtUtilsService } from '../auth/jwtUtils.service';

@Controller('route-planning')
export class RoutePlanningController {
  constructor(
    private readonly routePlanningService: RoutePlanningService,
    private readonly jwtService: JwtUtilsService,
  ) {}

  @Get('/route/:routeID')
  @Public()
  async findByRouteID(
    @Param() params: { routeID: string }
  ): Promise<ApiResponse<Route | null>> {
    const data = await this.routePlanningService.findByRouteID(params.routeID);
    return ApiResponse.build<Route | null>(
      HttpStatus.OK,
      data,
      'Tìm tuyến vận chuyển thành công',
    );
  }

  @Get('/route/waypoint/:waypointID')
  @Public()
  async findByWayPointID(
    @Param() params: { waypointID: string },
  ): Promise<ApiResponse<Route | null>> {
    return ApiResponse.build<Route | null>(
      HttpStatus.OK,
      await this.routePlanningService.findByWayPointID(params.waypointID),
      'Tìm tuyến vận chuyển thành công',
    );
  }

  @Get('/route/driver/:driverID')
  // @RoleMatch(Role.Driver, Role.Coordinator, Role.Admin, Role.Company)
  @Public()
  async findAllByDriverID(
    @Param() params: { driverID: string },
    @Query() query: ViewRouteRequestQuery,
    // @Req() req: Request,
  ): Promise<PaginationResponse<Route[]>> {
    const { page, limit } = query;

    const pagiParam: PaginationParams = {
      page: parseInt(page + '') || 1,
      limit: parseInt(limit + '') || 10,
    };

    const response: {
      data: Route[];
      total: number;
    } = await this.routePlanningService.findByDriverID(params.driverID, pagiParam);

    return PaginationResponse.build<Route[]>(
      HttpStatus.CREATED,
      response.data,
      'Tạo mô tài khoản thành công',
      pagiParam.page,
      response.total,
      pagiParam.limit,
    );
  }

  @Post('/route')
  @RoleMatch(Role.Coordinator)
  async createRouteForDriver(
    @Body() request: CreateRouteRequest,
    @Req() req: Request,
  ): Promise<ApiResponse<Route>> {
    const payload = await this.jwtService.extractAndDecodeToken(req);
    const coordinatorID = payload.sub;
    
    const {driverID, waypoints} = request;
    
    return ApiResponse.build<Route>(
      HttpStatus.CREATED,
      await this.routePlanningService.planningRoute(driverID, waypoints, coordinatorID),
      'Tạo đơn vận chuyển thành công',
    );
  }

  @Patch('/route/waypoint/:waypointID')
  @RoleMatch(Role.Coordinator)
  async updateWaypoint(
    @Body() request: UpdateWaypointRequest,
    @Param() params: { waypointID: string },
    @Req() req: Request,
  ): Promise<ApiResponse<Waypoint>> {
    const waypoint = await this.routePlanningService.updateWaypoint(request, params.waypointID);
    return ApiResponse.build<Waypoint>(
      HttpStatus.OK,
      waypoint,
      'Tìm tuyến vận chuyển thành công',
    );
  }

}
