import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const status = exception.getStatus();
    const message = exception.message || 'Internal server error';

    res.status(status).json({
      statusCode: status,
      status: status >= 400 && status < 500 ? 'fail' : 'error',
      message,
    });
  }
}
