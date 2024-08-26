import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  Param,
  Patch,
  UseGuards,
  NotFoundException,
  UsePipes,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { User } from './entities/user.entity';
import { CreateUserSchema } from 'src/utils/Joi_validation';
import { JoiValidationPipe } from 'src/utils/Joi_Validation_Pipe';
import { JwtAuthGuard } from 'auth/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  @UsePipes(new JoiValidationPipe(CreateUserSchema))
  async signup(
    @Body() createUserDto: CreateUserDto,
    @Res() res: any,
  ): Promise<void> {
    return this.userService.signup(createUserDto, res);
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res() res: any,
  ): Promise<void> {
    return this.userService.login(email, password, res);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('updatePassword')
  async updatePassword(
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
    @Req() req: any,
    @Res() res: any,
  ): Promise<void> {
    return this.userService.updatePassword(
      updateUserPasswordDto,
      req.user,
      res,
    );
  }

  @Post('forgotPassword')
  async forgotPassword(
    @Body('email') email: string,
    @Req() req: any,
    @Res() res: any,
  ): Promise<void> {
    return this.userService.forgotPassword(email, req, res);
  }

  @Patch('resetPassword/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body('password') password: string,
    @Body('passwordConfirm') passwordConfirm: string,
    @Res() res: any,
  ): Promise<void> {
    return this.userService.resetPassword(
      token,
      password,
      passwordConfirm,
      res,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any, @Res() res: any): Promise<void> {
    return this.userService.getMe(req.user, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUser(@Req() req: any, @Res() res: any, @Param('id') id: string): Promise<void> {
    return this.userService.getUser(id, res);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
    @Res() res: any,
  ): Promise<void> {
    return this.userService.updateMe(req.user.id, res, updateUserDto);
  }
}
