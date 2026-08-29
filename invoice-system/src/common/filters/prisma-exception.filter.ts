import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception.code === 'P2003') {
      const badRequest = new BadRequestException(
        'Cannot delete this record because other records depend on it.',
      );
      return response.status(400).json(badRequest.getResponse());
    }

    // Unknown Prisma error — surface as 500
    return response.status(500).json({ message: 'Database error', code: exception.code });
  }
}