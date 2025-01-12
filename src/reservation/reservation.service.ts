import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { APIFeatures } from 'src/utils/APIFeatures';
import {
  Reservation,
  ReservationDocument,
} from './entities/reservation.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film, FilmDocument } from 'src/film/entities/film.entity';
import { Hall, HallDocument } from 'src/hall/entities/hall.entity';
import { UpdateShowtimeSeatDto } from 'src/showtime-seats/dto/update-showtime-seat.dto';
import { ShowtimeSeats } from 'src/showtime-seats/entities/showtime-seat.entity';
import { User, UserDocument } from 'src/user/entities/user.entity';

@Injectable()
export class ReservationService {
  constructor(
    @InjectModel(Film.name) private readonly filmModel: Model<FilmDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Hall.name) private readonly hallModel: Model<HallDocument>,
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<ReservationDocument>,
    @InjectModel(ShowtimeSeats.name)
    private readonly showtimeSeatsModel: Model<ShowtimeSeats>,
  ) {}

  async findAll(queryString: any, res: any) {
    const features = new APIFeatures(this.reservationModel.find(), queryString)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const results = await features.query.exec();

    res.status(HttpStatus.OK).json({
      status: 'success',
      data: {
        results,
      },
    });
  }

  async findOne(userId: string, res: any) {
    console.log(userId);
    const reservation = await this.reservationModel.findById(userId).exec();

    if (!reservation) {
      throw new NotFoundException(`Reservation not found 🧾❌`);
    }

    res.status(HttpStatus.OK).json({
      status: 'success',
      data: {
        reservation,
      },
    });
  }

  async remove(id: string, res: any) {
    const reservation = await this.reservationModel
      .findByIdAndDelete(id)
      .exec();

    if (!reservation) {
      throw new NotFoundException(`Reservation not found ❌`);
    }

    res.status(HttpStatus.OK).json({
      status: 'success',
      data: {
        reservation,
      },
    });
  }

  async getPastPurchases(userId: string, res: any) {
    // console.log(userId);
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found 👤❌');
    }

    const pastPurchases = await this.reservationModel
      .find({ user: user._id })
      .sort({ createdAt: -1 })
      .exec();

    res.status(HttpStatus.OK).json({
      status: 'success',
      data: {
        pastPurchases,
      },
    });
  }
}
