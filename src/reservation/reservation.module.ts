import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Film, FilmSchema } from 'src/film/entities/film.entity';
import { FilmModule } from 'src/film/film.module';
import { Hall, HallSchema } from 'src/hall/entities/hall.entity';
import { HallModule } from 'src/hall/hall.module';
import { ShowtimeSeats, ShowtimeSeatsSchema } from 'src/showtime-seats/entities/showtime-seat.entity';
import { User, UserSchema } from 'src/user/entities/user.entity';
import { MailModule } from 'src/utils/mail.module';
import { Reservation, ReservationSchema } from './entities/reservation.entity';
import { JwtAuthGuard } from 'auth/auth.guard';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Film.name, schema:FilmSchema }]),
    MongooseModule.forFeature([{ name: ShowtimeSeats.name, schema: ShowtimeSeatsSchema }]),
    MongooseModule.forFeature([{ name: Hall.name, schema: HallSchema }]),
    MongooseModule.forFeature([{ name: Reservation.name, schema: ReservationSchema }]),
    MailModule,
  ],
  controllers: [ReservationController],
  providers: [ReservationService, JwtAuthGuard, UserService],
})
export class ReservationModule {}
