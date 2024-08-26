import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { FilmService } from '../film/film.service';
import { ShowtimeSeats, Seat } from './entities/showtime-seat.entity';
import { Hall, HallDocument } from 'src/hall/entities/hall.entity';
import { CreateShowtimeSeatDto } from './dto/create-showtime-seat.dto';
import { UpdateShowtimeSeatDto } from './dto/update-showtime-seat.dto';
import { Film, FilmDocument } from 'src/film/entities/film.entity';
import { APIFeatures } from 'src/utils/APIFeatures';
import { UserDocument } from 'src/user/entities/user.entity';
import { AppError } from 'src/common/app-error.exception';
import { Reservation } from 'src/reservation/entities/reservation.entity';

@Injectable()
export class ShowtimeSeatsService {
  constructor(
    @InjectModel(ShowtimeSeats.name)
    private readonly showtimeSeatsModel: Model<ShowtimeSeats>,
    @InjectModel(Hall.name) private readonly hallModel: Model<HallDocument>,
    private readonly filmService: FilmService,
    @InjectModel(Film.name) private readonly filmModel: Model<FilmDocument>,
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<Reservation>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async create(createShowtimeSeatDto: CreateShowtimeSeatDto, res: any) {
    const { film: filmTitle, showtime, seats } = createShowtimeSeatDto;

    const filmdoc = await this.filmModel.findOne({ title: filmTitle }).exec();
    if (!filmdoc) {
      throw new NotFoundException(`Film with title ${filmTitle} not found ❌`);
    }

    const hall = await this.hallModel.findById(filmdoc.hall).exec();
    if (!hall) {
      throw new NotFoundException(`Hall with ID ${filmdoc.hall} not found ❌`);
    }
    const showtimeSeat = await this.showtimeSeatsModel.create({
      film: filmdoc._id,
      hall: hall._id,
      showtime,
      seats,
    });

    res.status(HttpStatus.CREATED).json({
      status: 'success',
      data: {
        showtimeSeat,
      },
    });
  }

  async findAll(queryString: any, res: any) {
    // console.log(queryString);
    const features = new APIFeatures(
      this.showtimeSeatsModel.find().select('-seats'),
      queryString,
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // console.log(queryString);

    const results = await features.query.exec();
    // console.log("cmskms");

    res.status(HttpStatus.OK).json({
      status: 'success',
      data: {
        results,
      },
    });
  }

  async findOne(id: string, res: any) {
    const showtimeSeat = await this.showtimeSeatsModel.findById(id).exec();

    if (!showtimeSeat) {
      throw new NotFoundException(`Showtime Seats with ID ${id} not found ❌`);
    }

    res.status(HttpStatus.OK).json({
      status: 'success',
      data: {
        showtimeSeat,
      },
    });
  }

  async update(
    id: string,
    updateShowtimeSeatDto: UpdateShowtimeSeatDto,
    res: any,
  ) {
    const showtimeSeat = await this.showtimeSeatsModel.findById(id).exec();

    if (!showtimeSeat) {
      throw new NotFoundException(`Showtime Seats not found ❌`);
    }

    const { film: filmTitle, hall } = updateShowtimeSeatDto;

    if (filmTitle) {
      const filmdoc = await this.filmModel.findOne({ title: filmTitle }).exec();
      if (!filmdoc) {
        throw new NotFoundException(
          `Film with title ${filmTitle} not found ❌`,
        );
      }
      updateShowtimeSeatDto.film = filmdoc.id;
    }

    if (hall) {
      const halldoc = await this.hallModel.findById(hall).exec();
      if (!halldoc) {
        throw new NotFoundException(`Hall with ID ${hall} not found ❌`);
      }
      updateShowtimeSeatDto.hall = halldoc.id;
    }

    Object.assign(showtimeSeat, updateShowtimeSeatDto);

    const updatedShowtimeSeat = await showtimeSeat.save();

    res.status(HttpStatus.OK).json({
      status: 'success',
      data: {
        updatedShowtimeSeat,
      },
    });
  }

  async remove(id: string, res: any) {
    const deletedShowtimeSeat = await this.showtimeSeatsModel
      .findByIdAndDelete(id)
      .exec();

    if (!deletedShowtimeSeat) {
      throw new NotFoundException(`Showtime Seats with ID ${id} not found ❌`);
    }

    res.status(HttpStatus.OK).json({
      status: 'success',
      data: {
        deletedShowtimeSeat,
      },
    });
  }

  @Cron('0 0 * * *') // Every day at midnight
  async resetShowtimeSeats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await this.showtimeSeatsModel.deleteMany({});

    for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + dayOffset);

      const films = await this.filmService.getFilmsForDay(targetDate);

      for (const film of films) {
        const hall = await this.hallModel.findById(film.hall).exec();

        const showtimes = this.calculateShowtimesForDay(targetDate);
        for (const showtime of showtimes) {
          const seats = this.createSeats(hall.capacity);
          await this.showtimeSeatsModel.create({
            film: film._id,
            hall: hall.id,
            showtime,
            seats,
          });
        }
      }
    }
  }

  //cgbt
  private calculateShowtimesForDay(targetDate: Date): Date[] {
    const showtimes: Date[] = [];
    const startTime = 10; // 10 AM
    const duration = 2; // 2 hours per film
    const breakTime = 30; // 15 minutes between films + 15 min break

    for (let i = 0; i < 8; i++) {
      const showtime = new Date(targetDate);
      showtime.setHours(
        startTime + i * (duration + breakTime / 60),
        (i * breakTime) % 60,
      );
      showtime.setSeconds(0);
      showtime.setMilliseconds(0);

      showtimes.push(showtime);
    }

    return showtimes;
  }

  private createSeats(capacity: number): Seat[] {
    const seats: Seat[] = [];

    const n = Math.floor(Math.sqrt(capacity));
    let remainingSeats = capacity - n * n; // Seats beyond the square

    let rowLabel = 'A';

    for (let row = 0; row < n; row++) {
      for (let col = 1; col <= n; col++) {
        seats.push({ seatNum: `${col}${rowLabel}`, isReserved: false });
      }
      rowLabel = String.fromCharCode(rowLabel.charCodeAt(0) + 1); //A,B,C....
    }

    // If seats beyond square
    if (remainingSeats > 0) {
      for (let col = 1; col <= remainingSeats; col++) {
        seats.push({ seatNum: `${col}${rowLabel}`, isReserved: false });
      }
    }

    return seats;
  }

  // async onModuleInit() {
  //   await this.resetShowtimeSeats();
  // }

  async getAvailableSeats(id: string, res: any) {
    const showtime = await this.showtimeSeatsModel
      .findById(id)
      .select('seats')
      .exec();

    if (!showtime) {
      throw new NotFoundException(`Showtime with ID ${id} not found 🗓️❌`);
    }

    const availableSeats = showtime.seats.filter((seat) => !seat.isReserved);

    const filteredSeats = availableSeats.map(
      ({ seatNum, isReserved, ...rest }) => seatNum,
    );

    res.status(HttpStatus.OK).json({
      status: 'success',
      data: {
        filteredSeats,
      },
    });
  }

  async BuyTickets(
    user: UserDocument,
    showtimeid: string,
    inputSeats: string[],
    glasses: boolean,
    res: any,
  ) {
    const session = await this.connection.startSession({});
    session.startTransaction();

    try {
      let additionalMessage = '';

      //lock showtime for the session by using findById
      const showtime = await this.showtimeSeatsModel
        .findById(showtimeid)
        .session(session)
        .exec();

      if (!showtime) {
        throw new NotFoundException(`Showtime not found 🗓️❌`);
      }
      console.log(showtime.seats);

      const invalidSeats: string[] = [];

      for (const seatNum of inputSeats) {
        // console.log(seatNum);
        const seatInShowtime = showtime.seats.find(
          (s) => s.seatNum === seatNum,
        );

        // console.log(seatInShowtime);
        
        if (!seatInShowtime || seatInShowtime.isReserved) {
          invalidSeats.push(seatNum);
        }
      }

      // console.log(invalidSeats);

      if (invalidSeats.length > 0) {
        throw new AppError(
          `Invalid or already reserved seats: ${invalidSeats.join(', ')} 💺❌`,
          400,
        );
      }

      showtime.seats = showtime.seats.map((seat) => {
        if (inputSeats.includes(seat.seatNum)) {
          seat.isReserved = true;
        }
        return seat;
      });

      await showtime.save({ session });

      // Set a timeout to roll back if payment is not completed in 10 seconds
      const reservationTimeout = setTimeout(async () => {
        await session.abortTransaction();
        session.endSession();
        res.status(HttpStatus.REQUEST_TIMEOUT).json({
          status: 'fail',
          message: 'Transaction timed out, seats released ⏰❌',
        });
      }, 10000);

      const film = await this.filmModel
        .findById(showtime.film)
        .session(session)
        .exec();
      const hall = await this.hallModel
        .findById(showtime.hall)
        .session(session)
        .exec();

      let price = inputSeats.length * hall.price;
      film.totalAudience += inputSeats.length;
      film.totalRevenue += price;

      if (film.type === '3D' && glasses) {
        price += 50;
      } else if (film.type === '3D') {
        additionalMessage =
          'This is a 3D film, please include glasses 🕶️🎬❗.  ';
      }

      const reservation = new this.reservationModel({
        user: user._id,
        film: film._id,
        seats: inputSeats,
        hall: hall._id,
        totalPrice: price,
        glasses,
        showtime: showtime.showtime,
      });

      await reservation.save({ session });

      await session.commitTransaction();
      clearTimeout(reservationTimeout);
      session.endSession();

      res.status(HttpStatus.OK).json({
        status: 'success',
        message: `${additionalMessage}Seats ${inputSeats.join(', ')} successfully reserved 🎟️✅`,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
