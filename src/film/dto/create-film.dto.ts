import { IsString, IsNotEmpty, IsOptional, IsDate, IsEnum, IsNumber, IsArray } from 'class-validator';
import { Types } from 'mongoose';

export class CreateFilmDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsNumber()
  ratingsAverage?: number;

  @IsOptional()
  @IsNumber()
  ratingsQuantity?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  poster?: string;

  @IsNotEmpty()
  @IsString()
  duration: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsDate()
  releaseDate?: Date;

  @IsOptional()
  @IsDate()
  removeDate?: Date;

  @IsOptional()
  @IsNumber()
  totalAudience?: number;

  @IsOptional()
  @IsNumber()
  totalRevenue?: number;

  @IsArray()
  hall: Types.ObjectId;

  @IsNotEmpty()
  @IsEnum(['2D', '3D'])
  type: string;
}
