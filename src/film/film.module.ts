import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Hall, HallSchema } from 'src/hall/entities/hall.entity';
import { Reservation, ReservationSchema } from 'src/reservation/entities/reservation.entity';
import { User, UserSchema } from 'src/user/entities/user.entity';
import { Film, FilmSchema } from './entities/film.entity';
import { FilmController } from './film.controller';
import { FilmService } from './film.service';
import { JwtAuthGuard } from 'auth/auth.guard';
import { UserService } from 'src/user/user.service';
import { MailModule } from 'src/utils/mail.module';
import { ShowtimeSeats, ShowtimeSeatsSchema } from 'src/showtime-seats/entities/showtime-seat.entity';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Film.name, schema: FilmSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Hall.name, schema: HallSchema }]),
    MongooseModule.forFeature([{ name: ShowtimeSeats.name, schema: ShowtimeSeatsSchema }]),
    MongooseModule.forFeature([{ name: Reservation.name, schema: ReservationSchema }]),
    MailModule, 
  ],
  controllers: [FilmController],
  providers: [FilmService,JwtAuthGuard,UserService],
})
export class FilmModule {}

