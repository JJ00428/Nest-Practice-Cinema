import { IsOptional, IsDate, IsArray, IsMongoId } from 'class-validator';

export class UpdateShowtimeSeatDto {
  @IsOptional()
  @IsMongoId()
  film?: string;

  @IsOptional()
  @IsMongoId()
  hall?: string;

  @IsOptional()
  @IsDate()
  showtime?: Date;

  @IsOptional()
  @IsArray()
  seats?: {
    seatNum: string;
    isReserved?: boolean;
  }[];
}
