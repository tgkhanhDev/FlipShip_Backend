import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaPostgresService } from '../prisma/prisma.service';
import { Route, Waypoint } from '@prisma/client';
import { CreateRouteRequest } from './dto/routeRequest.dto';
import { AccountService } from '../account/account.service';
import { PaginationParams } from '../common/utils/response.dto';

@Injectable()
export class WaypointService {
  private readonly waypointRepository;

  constructor(
    private readonly repository: PrismaPostgresService,
    private readonly accountService: AccountService,
  ) {
    this.waypointRepository = repository.waypoint;
  }


}
