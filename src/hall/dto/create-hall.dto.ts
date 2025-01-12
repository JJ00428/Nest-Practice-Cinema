import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateHallDto {

  @IsNotEmpty()
  @Type(()=>Number)
  @IsNumber()
  hallNum: number;

  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsNotEmpty()
  @IsBoolean()
  Imax: boolean;

  @IsNotEmpty()
  @IsNumber()
  price:number;
}
