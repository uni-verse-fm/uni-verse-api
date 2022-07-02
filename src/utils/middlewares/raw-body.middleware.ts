import { Response } from 'express';
import { json } from 'body-parser';
import RequestWithRawBody from '../../payments/interfaces/request-with-raw-body.interface';

function rawBodyMiddleware() {
  return json({
    verify: (
      request: RequestWithRawBody,
      response: Response,
      buffer: Buffer,
    ) => {
      console.log('Raw Body Middleware');
      console.log(
        `url:  + ${request.url}\n buffer: ${buffer.toString()}`,
      );
      if (request.url === '/payments/webhook' && Buffer.isBuffer(buffer)) {
        console.log('Raw Body Middleware' + buffer.toString());
        request.rawBody = Buffer.from(buffer);
      }
      return true;
    },
  });
}

export default rawBodyMiddleware;
