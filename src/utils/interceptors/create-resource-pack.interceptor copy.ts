import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import ICreateResourcePack from '../../resource-packs/interfaces/create-resource-pack.interface';

@Injectable()
export class ResourcePackFormDataParserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (!request.body.data)
      throw new BadRequestException('Data is not available in the Form Data');

    try {
      const body: ICreateResourcePack = JSON.parse(request.body.data);
      request.body.data = body;
    } catch (error) {
      throw new BadRequestException(`Can't parse data: ${error}`);
    }
    return next.handle();
  }
}
