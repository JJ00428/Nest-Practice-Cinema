import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateHallDto {
  @IsNotEmpty()
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
