import { IsNotEmpty, IsDate, IsArray, IsMongoId, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateShowtimeSeatDto {
  @IsNotEmpty()
  @IsMongoId()
  film: Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  hall: Types.ObjectId;

  @IsNotEmpty()
  @IsDate()
  showtime: Date;

  @IsOptional()
  @IsArray()
  seats?: {
    seatNum: string;
    isReserved?: boolean;
  }[];
}
