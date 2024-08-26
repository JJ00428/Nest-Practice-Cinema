import { Test, TestingModule } from '@nestjs/testing';
import { ShowtimeSeatsController } from './showtime-seats.controller';
import { ShowtimeSeatsService } from './showtime-seats.service';

describe('ShowtimeSeatsController', () => {
  let controller: ShowtimeSeatsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShowtimeSeatsController],
      providers: [ShowtimeSeatsService],
    }).compile();

    controller = module.get<ShowtimeSeatsController>(ShowtimeSeatsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
