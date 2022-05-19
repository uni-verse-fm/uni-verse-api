import { MinioClientService } from '../../minio-client/minio-client.service';

export const MinioServiceMock = {
  provide: MinioClientService,
  useValue: {
    upload: jest.fn(() => {
      return 'https://www.example.com';
    }),
    delete: jest.fn(() => {
      return 'https://www.example.com';
    }),
  },
};
