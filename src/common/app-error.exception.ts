import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

export class AppError extends Error {
  readonly statusCode: number;
  readonly status: string;
  readonly isOperational: boolean;

  constructor(message: string, statusCode: HttpStatus) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    // Set the prototype explicitly for custom error class
    Object.setPrototypeOf(this, new.target.prototype);
  }
}


@Catch(HttpException)
export class HttpExceptionFilter<T extends HttpException>
  implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
  const ctx = host.switchToHttp();
  const response = ctx.getResponse<Response>();
  
  const status = exception.getStatus();
  const exceptionResponse = exception.getResponse();
  const error =
  typeof response === 'string'
  ? { message: exceptionResponse }
  : (exceptionResponse as object);
  
  response.status(status).json({
  ...error,
  timestamp: new Date().toISOString(),

  })
}
}