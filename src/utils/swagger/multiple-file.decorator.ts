/* Copyright (c) 2022 uni-verse corp */

import { ApiBody } from '@nestjs/swagger';

export const ApiMultiFileWithMetadata =
  (
    originalFileName = 'tracks',
    data = 'data',
    cover = 'cover',
  ): MethodDecorator =>
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
          [cover]: {
            type: 'string',
            format: 'binary',
          },
          [data]: {
            type: 'string',
          },
        },
      },
    })(target, propertyKey, descriptor);
  };
