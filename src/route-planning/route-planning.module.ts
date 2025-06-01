import { Module } from '@nestjs/common';
import { RoutePlanningService } from './route-planning.service';
import { RoutePlanningController } from './route-planning.controller';
import { AccountService } from '../account/account.service';

@Module({
  controllers: [RoutePlanningController],
  providers: [RoutePlanningService, AccountService],
})
export class RoutePlanningModule {}
