import { IsString, IsEmail, IsEnum, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsString()
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  readonly password: string;

  @IsString()
  readonly passwordConfirm: string;

  @IsEnum(['Seller', 'Buyer'])
  readonly role: string;

  @IsBoolean()
  readonly active: boolean;
}
