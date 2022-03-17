import { ApiBody } from '@nestjs/swagger';

export const ApiMultiFileWithMetadata = (fileName: string = 'files', data: string = 'data'): MethodDecorator => (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
) => {
    ApiBody({
        type: 'multipart/form-data',
        required: true,
        schema: {
            type: 'object',
            properties: {
                [fileName]: {
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