import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { FilmModule } from './film/film.module';
import { HallModule } from './hall/hall.module';
import { ShowtimeSeatsModule } from './showtime-seats/showtime-seats.module';
import { ReservationModule } from './reservation/reservation.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.DATABASE),
    UserModule,
    FilmModule,
    HallModule,
    ShowtimeSeatsModule,
    ReservationModule,
  ],
})
export class AppModule {}
