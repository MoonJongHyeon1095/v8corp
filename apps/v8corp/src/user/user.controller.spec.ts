import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const userServiceMock = {
      validateUser: jest.fn().mockResolvedValue({
        userId: 1,
        username: 'testUser',
        role: 'user',
      }),
      login: jest.fn().mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }),
      createUser: jest.fn().mockResolvedValue({
        userId: 1,
        username: 'testUser',
      }),
      refresh: jest.fn().mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: userServiceMock }],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('UserController가 정의되어 있어야 함', () => {
    expect(controller).toBeDefined();
  });

  it('로그인 요청시 유효한 토큰을 반환해야 함', async () => {
    const loginDto = { username: 'testUser', password: 'testPassword' };
    const response = await controller.login(loginDto);

    expect(userService.validateUser).toHaveBeenCalledWith(
      'testUser',
      'testPassword',
    );
    expect(response).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('회원가입 요청시 새로운 사용자 정보를 반환', async () => {
    const signupDto = { username: 'testUser', password: 'testPassword' };
    const response = await controller.signup(signupDto);

    expect(userService.createUser).toHaveBeenCalledWith(signupDto);
    expect(response).toEqual({
      userId: 1,
      username: 'testUser',
    });
  });

  it('엑세스 토큰 재발급 요청시 새로운 토큰을 반환해야 함', async () => {
    const mockRequest = {
      user: {
        userId: 1,
        username: 'testUser',
        role: 'user',
      },
    };
    const response = await controller.refresh(mockRequest as any);

    expect(userService.refresh).toHaveBeenCalledWith(mockRequest.user);
    expect(response).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
  });
});
