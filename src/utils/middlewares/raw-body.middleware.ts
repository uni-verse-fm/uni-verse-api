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
      console.debug(
        `url:  + ${buffer.toString()}\n buffer: ${buffer.toString()}`,
      );
      if (request.url === '/webhook' && Buffer.isBuffer(buffer)) {
        console.debug('Raw Body Middleware' + buffer.toString());
        request.rawBody = Buffer.from(buffer);
      }
      return true;
    },
  });
}

export default rawBodyMiddleware;
