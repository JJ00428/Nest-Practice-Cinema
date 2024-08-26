import { Module } from '@nestjs/common';
import { HallService } from './hall.service';
import { HallController } from './hall.controller';
import { JwtAuthGuard } from 'auth/auth.guard';
import { UserService } from 'src/user/user.service';
import { MailModule } from 'src/utils/mail.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Film, FilmSchema } from 'src/film/entities/film.entity';
import { Reservation, ReservationSchema } from 'src/reservation/entities/reservation.entity';
import { User, UserSchema } from 'src/user/entities/user.entity';
import { Hall, HallSchema } from './entities/hall.entity';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Hall.name, schema: HallSchema }]),
    MailModule],
  controllers: [HallController],
  providers: [HallService,JwtAuthGuard,UserService],
})
export class HallModule {}
