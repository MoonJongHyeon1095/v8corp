import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

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
      //호출될 때마다 미리 정의된 값을 반환
      createUser: jest.fn().mockResolvedValue({
        userId: 1,
        username: 'testUser',
        password: 'hashedPassword',
      }),
      //호출될 때 주어진 함수를 실행
      findByUsername: jest.fn().mockImplementation((username) => {
        if (username === 'existingUser')
          return Promise.resolve({
            userId: 2,
            username,
            password: 'hashedPassword',
            role: 'normal',
          });
        return null;
      }),
      updateRefreshToken: jest.fn().mockResolvedValue(true),
    };
    jwtServiceMock = {
      sign: jest.fn(() => 'mockToken'),
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
    it('유저이름 중복', async () => {
      const signupDto = { username: 'existingUser', password: 'testPass' };
      await expect(service.createUser(signupDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('회원가입', async () => {
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
  });

  describe('validateUser', () => {
    it('비번 일치하지 않으면 401', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
      await expect(
        service.validateUser('testUser', 'wrongPass'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('로그인 성공시 토큰 발급', async () => {
      const validatedUserDto = {
        userId: 1,
        username: 'testUser',
        role: 'normal',
      };

      const result = await service.login(validatedUserDto);

      expect(jwtServiceMock.sign).toHaveBeenCalledWith(expect.any(Object), {
        expiresIn: '60m',
      });
      expect(jwtServiceMock.sign).toHaveBeenCalledWith(expect.any(Object), {
        expiresIn: '7d',
      });
      expect(result.accessToken).toContain('mockToken');
      expect(result.refreshToken).toContain('mockToken');
    });
  });

  describe('refresh', () => {
    it('토큰 재발급', async () => {
      const validatedUserDto = {
        userId: 1,
        username: 'testUser',
        role: 'normal',
      };

      const result = await service.refresh(validatedUserDto);

      expect(result.accessToken).toContain('mockToken');
      expect(result.refreshToken).toContain('mockToken');
      expect(userRepositoryMock.updateRefreshToken).toHaveBeenCalledWith(
        1,
        expect.any(String),
      );
    });
  });
});
