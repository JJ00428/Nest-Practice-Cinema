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
} from '@nestjs/common';
import { HallService } from './hall.service';
import { CreateHallDto } from './dto/create-hall.dto';
import { UpdateHallDto } from './dto/update-hall.dto';
import { JwtAuthGuard } from 'auth/auth.guard';
import { createHallSchema } from 'src/utils/Joi_validation';
import { JoiValidationPipe } from 'src/utils/Joi_Validation_Pipe';

@Controller('hall')
export class HallController {
  constructor(private readonly hallService: HallService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(createHallSchema))
  create(@Body() createHallDto: CreateHallDto, @Res() res: any): Promise<void> {
    return this.hallService.AddHall(createHallDto, res);
  }

  @Get()
  findAll(@Res() res: any): Promise<void> {
    return this.hallService.findAllHalls(res);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Res() res: any): Promise<void> {
    return this.hallService.findOneHall(id, res);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateHallDto: UpdateHallDto,
    @Res() res: any,
  ): Promise<void> {
    return this.hallService.updateHall(id, updateHallDto, res);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Res() res: any): Promise<void> {
    return this.hallService.removeHall(id, res);
  }
}
