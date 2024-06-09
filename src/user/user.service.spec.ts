import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('UserService', () => {
  let service: UserService;
  let userRepositoryMock: Partial<UserRepository>;
  let jwtServiceMock: Partial<JwtService>;

  beforeEach(async () => {
    userRepositoryMock = {
      createUser: jest.fn().mockResolvedValue({
        userId: 1,
        username: 'testUser',
        password: 'hashedPassword',
      }),
      findByUsername: jest.fn().mockResolvedValue({
        userId: 1,
        username: 'testUser',
        password: 'hashedPassword',
        role: 'normal',
      }),
      updateRefreshToken: jest.fn().mockResolvedValue(true),
    };

    jwtServiceMock = {
      sign: jest.fn().mockReturnValue('mockToken'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: userRepositoryMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('새 유저 생성', async () => {
      const signupDto = { username: 'testUser', password: 'testPass' };
      const result = await service.createUser(signupDto);

      expect(userRepositoryMock.createUser).toHaveBeenCalledWith(
        'testUser',
        'hashedPassword',
        'normal',
      );
      expect(result).toEqual({
        userId: 1,
        username: 'testUser',
      });
    });

    it('회원가입 에러', async () => {
      jest.spyOn(bcrypt, 'hash').mockRejectedValue(new Error('Hashing failed'));
      const signupDto = { username: 'testUser', password: 'testPass' };

      await expect(service.createUser(signupDto)).rejects.toThrow(
        'Hashing failed',
      );
    });
  });

  describe('validateUser', () => {
    it('비밀번호 비교 검증', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      const result = await service.validateUser('testUser', 'testPass');

      expect(result).toEqual({
        userId: 1,
        username: 'testUser',
        role: 'normal',
      });
    });

    it('유저가 조회되지 않으면 null 응답', async () => {
      jest.spyOn(userRepositoryMock, 'findByUsername').mockResolvedValue(null);
      const result = await service.validateUser('testUser', 'testPass');

      expect(result).toBeNull();
    });

    it('비밀번호가 일치하지 않으면 null 반환', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
      const result = await service.validateUser('testUser', 'wrongPass');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('accessToken, refreshToken 생성', async () => {
      const validatedUserDto = {
        userId: 1,
        username: 'testUser',
        role: 'normal',
      };

      const result = await service.login(validatedUserDto);

      expect(result).toEqual({
        accessToken: 'Bearer mockToken',
        refreshToken: 'Bearer mockToken',
      });
      expect(jwtServiceMock.sign).toHaveBeenCalledTimes(2);
    });
  });
});
