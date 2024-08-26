import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';
import { UserService } from 'src/user/user.service';
import { promisify } from 'util';

@Injectable()
export class JwtAuthGuard extends PassportAuthGuard('jwt') {
  constructor(private readonly userService: UserService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let token: string;

    // Extract token from Authorization header or cookies
    if (request.headers.authorization && request.headers.authorization.startsWith('Bearer')) {
      token = request.headers.authorization.split(' ')[1];
    } else if (request.cookies && request.cookies.jwt) {
      token = request.cookies.jwt;
    } else {
      throw new UnauthorizedException('No token provided. Please log in.');
    }

    if (!token) {
      throw new UnauthorizedException('You are not logged in! Please log in.');
    }

    // console.log('token: ' + token);

    try {
      const decoded: any = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

      // console.log('decoded: ' + decoded);
      
      // Fetch user from the database
      const user = await this.userService.findById(decoded.id);
      if (!user) {
        throw new UnauthorizedException('The user belonging to this token does no longer exist.');
      }

      // if (this.userService.changedPasswordAfter(decoded.iat, user)) {
      //   throw new UnauthorizedException('User recently changed password! Please log in again.');
      // }

      request.user = user;
      return true;
    } catch (err) {
      throw err;
    }
  }

  
}
