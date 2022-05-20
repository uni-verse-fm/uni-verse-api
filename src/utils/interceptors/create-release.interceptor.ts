import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import ICreateRelease from '../../releases/interfaces/create-release.interface';

@Injectable()
export class ReleaseFormDataParserInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ReleaseFormDataParserInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.logger.log('intercepting release form data');
    const request = context.switchToHttp().getRequest();

    if (!request.body.data)
      throw new BadRequestException('Data is not available in the Form Data');
    try {
      const body: ICreateRelease = JSON.parse(request.body.data);
      request.body.data = body;
      if (!body.title) throw new Error();
    } catch (error) {
      throw new BadRequestException(`Can't parse data: ${error}`);
    }
    return next.handle();
  }
}
