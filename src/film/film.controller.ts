import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UsePipes,
  UseGuards,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilmService } from './film.service';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { createFilmSchema } from 'src/utils/Joi_validation';
import { JoiValidationPipe } from 'src/utils/Joi_Validation_Pipe';
import { JwtAuthGuard } from 'auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AppError } from 'src/common/app-error.exception';

@Controller('film')
export class FilmController {
  constructor(private readonly filmService: FilmService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(createFilmSchema))
  async AddFilm(
    @Body() createFilmDto: CreateFilmDto,
    @Res() res: any,
  ): Promise<void> {
    return this.filmService.addFilm(createFilmDto, res);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.filmService.findAll(query);
  }

  @Get(':id')
  async findOne(@Res() res: any, @Param('id') id: string): Promise<void> {
    return this.filmService.findOne(id, res);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFilmDto: UpdateFilmDto,
    @Res() res: any,
  ): Promise<void> {
    return this.filmService.updateFilm(id, updateFilmDto, res);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filmService.remove(id);
  }

  @Get('/showtimes/:id')
  async getFilmShowtimes(
    @Res() res: any,
    @Param('id') id: string,
  ): Promise<void> {
    return this.filmService.getFilmShowtimes(id, res);
  }

  @Get('/Revenue-Audience/:id')
  async getFilmRevenueAndAudience(
    @Res() res: any,
    @Param('id') id: string,
  ): Promise<void> {
    return this.filmService.getFilmRevenueAndAudience(id, res);
  }

  @Post(':id/addPoster')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('poster', {
      storage: diskStorage({
        destination: 'src/film/uploads/posters',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);

          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        console.log('File MIME type:', file.mimetype);
        const ext = extname(file.originalname).toLowerCase();
        const allowedExtensions = ['.jpg', '.jpeg', '.png'];

        if (
          file.mimetype.startsWith('image') &&
          allowedExtensions.includes(ext)
        ) {
          return cb(null, true);
        }

        cb(new AppError('Only image files are allowed! 🖼️❗', 400), false);
      },
    }),
  )
  uploadPoster(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: any,
  ): Promise<void> {
    return this.filmService.uploadPoster(id, file, res);
  }
}
