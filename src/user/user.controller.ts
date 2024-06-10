import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { SignupDto, SignupResponseDto } from './dto/signup.dto';
import { SignupPipe } from './pipe/signup.pipe';
import { UserService } from './user.service';
import { Request } from 'express';
import { ValidatedUserDto } from './dto/user.dto';
import { RefreshResponseDto } from './dto/refresh.dto';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
@ApiTags('User')
@Controller('v1/api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 로그인 API
   * @param loginDto username, password
   * @returns accessToken, refreshToken
   */
  @Post('login')
  @UsePipes(new SignupPipe())
  @ApiOperation({
    summary: 'Login',
    description: 'username, password로 로그인',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: '로그인 성공',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    return this.userService.login(user);
  }

  /**
   * 회원가입 API
   * @param signupDto username, password
   * @returns 가입한 회원 정보
   */
  @Post('signup')
  @UsePipes(new SignupPipe())
  @ApiOperation({
    summary: 'Signup',
    description: 'username, password로 회원가입',
  })
  @ApiBody({ type: SignupDto })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    type: SignupResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async signup(@Body() signupDto: SignupDto): Promise<SignupResponseDto> {
    return this.userService.createUser(signupDto);
  }

  /**
   * 엑세스 토큰 재발급
   * @returns accessToken, refreshToken
   */
  @Post('refresh')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Refresh Token',
    description: 'Authorazation 헤더에 refreshToken을 전송',
  })
  @ApiResponse({
    status: 200,
    description: '토큰 재발급',
    type: RefreshResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async refresh(@Req() req: Request): Promise<RefreshResponseDto> {
    const user = req.user as ValidatedUserDto;

    return this.userService.refresh(user);
  }
}
