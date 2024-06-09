import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
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
  async signup(@Body() signupDto: SignupDto): Promise<SignupResponseDto> {
    return this.userService.createUser(signupDto);
  }

  /**
   * 엑세스 토큰 재발급
   * @returns accessToken, refreshToken
   */
  @Post('refresh')
  @UseGuards(AuthGuard('jwt'))
  async refresh(@Req() req: Request): Promise<RefreshResponseDto> {
    const user = req.user as ValidatedUserDto;

    return this.userService.refresh(user);
  }
}
