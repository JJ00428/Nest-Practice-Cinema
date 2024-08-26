import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtAuthGuard } from 'auth/auth.guard';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get()
  findAll(@Query() query: any, @Res() res: Response): Promise<void> {
    return this.reservationService.findAll(query, res);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Res() res: Response): Promise<void> {
    return this.reservationService.findOne(id, res);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Res() res: Response): Promise<void> {
    return this.reservationService.remove(id, res);
  }

  @Get('MyPurchases/getData')
  @UseGuards(JwtAuthGuard)
  getPastPurchases(@Req() req: any, @Res() res: Response): Promise<void> {
    return this.reservationService.getPastPurchases(req.user.id, res);
  }
}
