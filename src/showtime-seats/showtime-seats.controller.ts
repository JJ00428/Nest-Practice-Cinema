import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseGuards,
  UsePipes,
  Query,
  Req,
} from '@nestjs/common';
import { ShowtimeSeatsService } from './showtime-seats.service';
import { CreateShowtimeSeatDto } from './dto/create-showtime-seat.dto';
import { UpdateShowtimeSeatDto } from './dto/update-showtime-seat.dto';
import { JwtAuthGuard } from 'auth/auth.guard';
import { showtimeSeatsSchema } from 'src/utils/Joi_validation';
import { JoiValidationPipe } from 'src/utils/Joi_Validation_Pipe';

@Controller('showtime-seats')
export class ShowtimeSeatsController {
  constructor(private readonly showtimeSeatsService: ShowtimeSeatsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(showtimeSeatsSchema))
  create(
    @Body() createShowtimeSeatDto: CreateShowtimeSeatDto,
    @Res() res: Response,
  ) {
    return this.showtimeSeatsService.create(createShowtimeSeatDto, res);
  }

  @Get()
  findAll(@Query() query: any, @Res() res: Response) {
    return this.showtimeSeatsService.findAll(query,res);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Res() res: Response) {
    return this.showtimeSeatsService.findOne(id, res);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateShowtimeSeatDto: UpdateShowtimeSeatDto,
    @Res() res: Response,
  ) {
    return this.showtimeSeatsService.update(id, updateShowtimeSeatDto, res);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Res() res: Response) {
    return this.showtimeSeatsService.remove(id, res);
  }

  @Post('reset')
  @UseGuards(JwtAuthGuard)
  resetShowtimeSeats() {
    return this.showtimeSeatsService.resetShowtimeSeats();
  }

  @Get('/availabeSeats/:id')
  @UseGuards(JwtAuthGuard)
  getAvailableSeats(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    return this.showtimeSeatsService.getAvailableSeats(id, res);
  }

  @Post('/buy-tickets/:id')
  @UseGuards(JwtAuthGuard)
  buyTickets(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { seats: string[], glasses: boolean },
    @Res() res: Response,
  ): Promise<void> {
    const { seats, glasses } = body;
    return this.showtimeSeatsService.BuyTickets(req.user.id, id, seats, glasses, res);
  }
}
