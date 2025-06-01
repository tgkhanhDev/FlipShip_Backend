import { Body, Controller, Get, Post, Req, Param, Query, HttpStatus } from '@nestjs/common';
import { RoutePlanningService } from './route-planning.service';
import { CreateRouteRequest, ViewRouteRequestQuery } from './dto/routeRequest.dto';
import { Request } from 'express';
import { RoleMatch } from '../common/utils/metadata';
import { Role, Route } from '@prisma/client';
import { Public} from 'src/common/utils/metadata';
import { PaginationParams, PaginationResponse } from '../common/utils/response.dto';
import { ApplicationResponse } from '../application-portal/dto/applicationResponse.dto';

@Controller('route-planning')
export class RoutePlanningController {
  constructor(private readonly routePlanningService: RoutePlanningService) {}

  @Get('/route/:routeID')
  @Public()
  async findByRouteID(@Param('routeID') routeID: string): Promise<Route | null> {
    return await this.routePlanningService.findByRouteID(routeID);
  }

  @Get('/route-by-waypoint/:waypointID')
  @Public()
  async findByWayPointID(@Param('waypointID') waypointID: string): Promise<Route | null> {
    return await this.routePlanningService.findByWayPointID(waypointID);
  }

  @Get('/route-by-driver/:driverID')
  @RoleMatch(Role.Driver, Role.Coordinator, Role.Admin, Role.Company)
  async findAllByDriverID(@Param('driverID') driverID: string,
                       @Query() query: ViewRouteRequestQuery,
                       @Req() req: Request
                       ): Promise<PaginationResponse<Route[]>> {
    const { page, limit } = query;

    const pagiParam: PaginationParams = {
      page: parseInt(page + '') || 1,
      limit: parseInt(limit + '') || 10,
    };

    const response: { data: Route[]; total: number } = await this.routePlanningService.findByDriverID(driverID, pagiParam);

    return PaginationResponse.build<Route[]>(
      HttpStatus.CREATED,
      response.data,
      'Tạo mô tài khoản thành công',
      pagiParam.page,
      response.total,
      pagiParam.limit,
    );

  }



  @Post('')
  @RoleMatch(Role.Company, Role.Coordinator)
  async createRouteForDriver(
    @Body() request: CreateRouteRequest,
    @Req() req: Request
  ){

  }
}
