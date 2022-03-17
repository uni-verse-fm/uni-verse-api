import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from "@nestjs/common";
import { Observable } from "rxjs";
import ICreateRelease from "../../releases/interfaces/create-release.interface";


@Injectable()
export class FormDataParserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    const request = context.switchToHttp().getRequest()

    if(!request.body.data) throw new BadRequestException("Data is not available in the Form Data")

    try {
        const body: ICreateRelease = JSON.parse(request.body.data);
        request.body.data = body;
    } catch (error) {
        throw new BadRequestException(`Can't parse data: ${error}`)
    }

    return next.handle();
  }
}