import { Logger, Module } from '@nestjs/common';
import { RoutePlanningService } from './route-planning.service';
import { RoutePlanningController } from './route-planning.controller';
import { AccountService } from '../account/account.service';
import { JwtUtilsService } from '../auth/jwtUtils.service';

@Module({
  controllers: [RoutePlanningController],
  providers: [RoutePlanningService, AccountService, JwtUtilsService, Logger],
})
export class RoutePlanningModule {}
