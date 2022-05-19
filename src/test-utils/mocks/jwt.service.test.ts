import { JwtService } from '@nestjs/jwt';

export const JwtServiceMock = {
  provide: JwtService,
  useValue: {
    sign: () => 'mercure23beta',
  },
};
