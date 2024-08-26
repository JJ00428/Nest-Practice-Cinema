import * as express from 'express';
import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { Film, FilmDocument } from './entities/film.entity';
import { Hall, HallDocument } from 'src/hall/entities/hall.entity';
import { ShowtimeSeats } from 'src/showtime-seats/entities/showtime-seat.entity';
import { APIFeatures } from 'src/utils/APIFeatures';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AppError } from 'src/common/app-error.exception';

type MulterFile = Express.Multer.File;

@Injectable()
export class FilmService {
  constructor(
    @InjectModel(Film.name) private readonly filmModel: Model<FilmDocument>,
    @InjectModel(Hall.name) private readonly hallModel: Model<HallDocument>,
    @InjectModel(ShowtimeSeats.name)
    private readonly showtimeSeatsModel: Model<ShowtimeSeats>,
  ) {}

  async addFilm(createFilmDto: CreateFilmDto, res: any) {
    const { hall } = createFilmDto;

    const hallDoc = await this.hallModel.findOne({ hallNum: hall }).exec();
    if (!hallDoc) {
      throw new NotFoundException(`Hall number ${hall} not found ❌`);
    }

    const hallId = hallDoc.id;
    createFilmDto.hall = hallId;

    const newFilm = new this.filmModel(createFilmDto);
    const film = await newFilm.save();

    res.status(HttpStatus.OK).json({
      status: 'success',
      data: {
        film,
      },
    });
  }

  async findAll(queryString: any): Promise<Film[]> {
    const features = new APIFeatures(
      this.filmModel.find().populate({
        path: 'hall',
        select: 'hallNum Imax',
      }),
      queryString,
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const results = await features.query.exec();
    return results;
  }

  async findOne(id: string, res: any) {
    const film = await this.filmModel
      .findById(id)
      .populate({
        path: 'hall',
        select: 'hallNum Imax',
      })
      .exec();

    if (!film) {
      throw new NotFoundException(`Film not found 🎬❌`);
    }

    res.status(HttpStatus.OK).json({
      status: 'success',
      data: {
        film,
      },
    });
  }

  async updateFilm(id: string, updateFilmDto: UpdateFilmDto, res: any) {
    const film = await this.filmModel.findById(id);

    if (!film) {
      throw new NotFoundException(`Film not found 🎬❌`);
    }

    const { hall } = updateFilmDto;
    if (hall) {
      const hallDoc = await this.hallModel.findOne({ hallNum: hall }).exec();
      if (!hallDoc) {
        throw new NotFoundException(`Hall number ${hall} not found ❌`);
      }

      const hallId = hallDoc.id;
      updateFilmDto.hall = hallId;
    }

    const filteredBody = this.filterObj(
      updateFilmDto,
      'title',
      'description',
      'poster',
      'duration',
      'genre',
      'slug',
      'releaseDate',
      'removeDate',
      'hall',
      'type',
      'cast',
    );

    Object.keys(filteredBody).forEach((key) => {
      film[key] = filteredBody[key];
    });

    const updatedFilm = await film.save();

    res.status(HttpStatus.OK).json({
      status: 'success',
      data: {
        updatedFilm,
      },
    });
  }

  private filterObj(obj: any, ...allowedFields: string[]) {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  }

  async remove(id: string): Promise<Film> {
    const deletedFilm = await this.filmModel.findByIdAndDelete(id).exec();
    if (!deletedFilm) {
      throw new NotFoundException(`Film not found 🎬❌`);
    }
    return deletedFilm;
  }

  async getFilmsForDay(date: Date): Promise<Film[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const films = await this.filmModel
      .find({
        releaseDate: { $lte: endOfDay },
        removeDate: { $gte: startOfDay },
      })
      .exec();

    return films;
  }

  async getFilmShowtimes(id: string, res: any) {
    const showtimes = await this.showtimeSeatsModel
      .find({ film: id })
      .select('-seats')
      .exec();
    if (!showtimes) {
      throw new NotFoundException(
        `No showtimes found for this film this week 🎬🗓️❌`,
      );
    }

    const filteredShowtimes = showtimes.map((showtime) => {
      const { film, hall, __v, ...rest } = showtime.toObject();
      return rest;
    });

    res.status(HttpStatus.OK).json({
      status: 'success',
      data: {
        filteredShowtimes,
      },
    });
  }

  async getFilmRevenueAndAudience(id: string, res: any) {
    const film = await this.filmModel.findById(id).exec();
    if (!film) {
      throw new NotFoundException(`Film not found 🎬❌`);
    }

    const totalRevenue = film.totalRevenue || 0;
    const totalAudience = film.totalAudience || 0;

    res.status(HttpStatus.OK).json({
      status: 'success',
      data: {
        totalFilmRevenue: totalRevenue,
        totalFilmAudience: totalAudience,
      },
    });
  }

  

  async uploadPoster(id: string, file: MulterFile, res: any) {
    const film = await this.filmModel.findById(id).exec();

    if (!film) {
      throw new NotFoundException(`Film not found 🎬❌`);
    }

    if(!file){
      throw new AppError('No Poster uploaded! 🖼️❗',400);
    }

    film.poster = file.path;
    await film.save();

    res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'Poster uploaded successfully 🎥✅',
      data: {
        film,
      },
    });
  }
}
