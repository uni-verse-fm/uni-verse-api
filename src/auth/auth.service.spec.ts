import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import mockedJwtService from '../test-utils/mocks/jwt-mock.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
	let service: AuthService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: JwtService,
					useValue: mockedJwtService
				},
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
	});

	describe('when login', () => {
		it('should return a string', async () => {
			const userId = "1";
            let jwt = await service.login(userId)
			expect(
				jwt
			).toBe('mercure23beta')
		})
	})
});
