import { Injectable, UnauthorizedException, ForbiddenException, NotFoundException, BadRequestException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { promisify } from 'util';
import { User, UserDocument } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { MailService } from 'src/utils/mail.service';
import { AppError } from '../common/app-error.exception';
import { CreateUserSchema } from 'src/utils/Joi_validation';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/update-user.dto';
import { stringify } from 'flatted';



@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly mailService: MailService,
  ) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async changedPasswordAfter(JWTTimestamp: number, user): Promise<boolean> {
    if (user.passwordChangedAt) {
      const changedTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000);
      // console.log(`JWTTimeStamp ${JWTTimestamp}, ChangedTimeStamp ${changedTimestamp}`);
      return JWTTimestamp > changedTimestamp;
    }
    return false;
  }

  createPasswordResetToken(user): string {
    const resetToken = crypto.randomBytes(32).toString('hex');

    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    return resetToken;
  }

  private signToken(id: string): string {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }

  private createSendToken(user: UserDocument, statusCode: number, res: any): void {
    const token = this.signToken(user._id.toString());
    const cookieOptions = {
      expires: new Date(
        Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) * 24 * 60 * 60 * 1000,
      ),
      httpOnly: true,
    };
    if (process.env.NODE_ENV === 'production') cookieOptions['secure'] = true;

    res.cookie('jwt', token, cookieOptions);
    user.password = undefined;

    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  }

  async signup(createUserDto: CreateUserDto, res: any): Promise<void> {
    const { error, value } = CreateUserSchema.validate(createUserDto);

    if (error) {
      throw new AppError(error.details[0].message, 422);
    }

    try {
      // Check for duplicate email
      const emailExists = await this.userModel.findOne({ email: value.email });
      if (emailExists) {
        throw new AppError('Email already in use 📧❗', 400);
      }

      const newUser = new this.userModel({
        ...createUserDto,
        passwordChangedAt: Date.now(),
      });
      await newUser.save();

      this.createSendToken(newUser, 201, res);

    } catch (err) {
      throw err;
    }
  }

  async login(email: string, password: string, res: any): Promise<void> {
    if (!email || !password) {
      throw new BadRequestException('Please provide email and password! 📛');
    }
  
    const user = await this.userModel.findOne({ email }).exec();
    
    // Check if user exists
    if (!user) {
      throw new UnauthorizedException('Incorrect email ❌');
    }
  
    // console.log(password);
    // console.log(user);

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Incorrect password ❌');
    }
  
    this.createSendToken(user, 200, res);
  }
  
  

  restrictTo(...roles: string[]) {
    return (req: any, res: any, next: any): void => {
      if (!roles.includes(req.user.role)) {
        throw new ForbiddenException('You do not have permission to access this route ❌');
      }
      next();
    };
  }

  async forgotPassword(email: string, req: any, res: any): Promise<void> {

    if (!email) {
      throw new BadRequestException('Please provide an email address 📧');
    }

    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('There is no user with email address 📧❌');
    }

    const resetToken = this.createPasswordResetToken(user);
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/marketAPI/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL} 🔑.\nIf you didn't forget your password, please ignore this email!`;

    try {
      await this.mailService.sendEmail({
        to: user.email,
        subject: 'Your password reset token (valid for 10 min) 🔑🕑',
        text: message,
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      throw new AppError('There was an error sending the email. Try again later! ❌', 500);
    }
  }

  async resetPassword(token: string, password: string, passwordConfirm: string, res: any): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.userModel.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() }});

    if (!user) {
      throw new BadRequestException('Token is invalid or expired. Please try again.');
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    this.createSendToken(user, 200, res);
  }

  async updatePassword(updateUserPasswordDto: UpdateUserPasswordDto, user: UserDocument, res: any): Promise<void> {
    const { passwordCurrent, password, passwordConfirm } = updateUserPasswordDto;

    if (!passwordCurrent && !password && !passwordConfirm) { 
      throw new BadRequestException('Please provide your current password, a new password and passwordConfirm. 🔑');
    }
    const currentUser = await this.userModel.findById(user.id).select('+password');

    if (!(await bcrypt.compare(passwordCurrent, currentUser.password))) {
      throw new UnauthorizedException('Your current password is wrong. 🔑❌');
    }

    
    if (password!== passwordConfirm) {
      throw new BadRequestException('Password and PasswordConfirm do not match. 🔑');
    }

    currentUser.password = password;
    currentUser.passwordConfirm = passwordConfirm;
    await currentUser.save();

    this.createSendToken(currentUser, 200, res);
  }

  async getMe(user: UserDocument, res: any) {
    // const user = await this.userModel.findById(userId);
    res.status(HttpStatus.OK).json({
      status: 'success',
      data: {
        user,
      },
    });
  }

  async getUser(userId: string, res: any) {
    const user = await this.userModel.findById(userId);
    res.status(HttpStatus.OK).json({
      status: 'success',
      data: {
        user,
      },
    });
  }

  async updateMe(userId: string, res: any, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password || updateUserDto.passwordConfirm) {
      throw new BadRequestException('This route is not for password updates. Please use /updateMyPassword. 🔑🚫');
    }
  
    const filteredBody = this.filterObj(updateUserDto, 'username', 'email');
  
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
  
    Object.keys(filteredBody).forEach(key => {
      user[key] = filteredBody[key];
    });

    const updatedUser = await user.save();
 
    res.status(HttpStatus.OK).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  }
  


  private filterObj(obj: any, ...allowedFields: string[]) {
    const newObj = {};
    Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  }
  
}
