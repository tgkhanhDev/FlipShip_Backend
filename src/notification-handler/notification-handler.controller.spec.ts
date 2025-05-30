import { Test, TestingModule } from '@nestjs/testing';
import { NotificationHandlerController } from './notification-handler.controller';
import { NotificationHandlerService } from './notification-handler.service';

describe('NotificationHandlerController', () => {
  let controller: NotificationHandlerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationHandlerController],
      providers: [NotificationHandlerService],
    }).compile();

    controller = module.get<NotificationHandlerController>(NotificationHandlerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
