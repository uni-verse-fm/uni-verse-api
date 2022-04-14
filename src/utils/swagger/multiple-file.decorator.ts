import { ApiBody } from '@nestjs/swagger';

export const ApiMultiFileWithMetadata =
  (originalFileName = 'files', data = 'data'): MethodDecorator =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    ApiBody({
      type: 'multipart/form-data',
      required: true,
      schema: {
        type: 'object',
        properties: {
          [originalFileName]: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
          },
          [data]: {
            type: 'string',
          },
        },
      },
    })(target, propertyKey, descriptor);
  };
