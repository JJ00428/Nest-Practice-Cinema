import { IsString } from 'class-validator';

export class UpdateUserPasswordDto {
  @IsString()
  readonly passwordCurrent: string;

  @IsString()
  readonly password: string;

  @IsString()
  readonly passwordConfirm: string;
}
