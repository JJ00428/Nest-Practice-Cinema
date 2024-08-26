import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtAuthGuard } from 'auth/auth.guard';
import { Film, FilmSchema } from 'src/film/entities/film.entity';
import { FilmModule } from 'src/film/film.module';
import { Hall, HallSchema } from 'src/hall/entities/hall.entity';
import { HallModule } from 'src/hall/hall.module';
import { User, UserSchema } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { MailModule } from 'src/utils/mail.module';
import { ShowtimeSeats, ShowtimeSeatsSchema } from './entities/showtime-seat.entity';
import { ShowtimeSeatsController } from './showtime-seats.controller';
import { ShowtimeSeatsService } from './showtime-seats.service';
import { FilmService } from 'src/film/film.service';
import { Reservation, ReservationSchema } from 'src/reservation/entities/reservation.entity';
import { ReservationModule } from 'src/reservation/reservation.module';



@Module({
  imports: [
    FilmModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Film.name, schema:FilmSchema }]),
    MongooseModule.forFeature([{ name: ShowtimeSeats.name, schema: ShowtimeSeatsSchema }]),
    MongooseModule.forFeature([{ name: Hall.name, schema: HallSchema }]),
    MongooseModule.forFeature([{ name: Reservation.name, schema: ReservationSchema }]),
    ReservationModule,
    MailModule,
    HallModule
  ],
  controllers: [ShowtimeSeatsController],
  providers: [ShowtimeSeatsService,FilmService, JwtAuthGuard, UserService],
})
export class ShowtimeSeatsModule {}
