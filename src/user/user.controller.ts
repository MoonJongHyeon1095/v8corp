import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UsePipes,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { SignupPipe } from './pipe/signup.pipe';
import { UserService } from './user.service';

@Controller('v1/api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  @UsePipes(new SignupPipe())
  async login(@Body() loginDto: LoginDto) {
    try {
      const user = await this.userService.validateUser(
        loginDto.username,
        loginDto.password,
      );
      if (!user) {
        throw new HttpException(
          '인증정보가 올바르지 않습니다',
          HttpStatus.UNAUTHORIZED,
        );
      }
      return this.userService.login(user);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('signup')
  @UsePipes(new SignupPipe())
  async signup(@Body() signupDto: SignupDto) {
    try {
      const user = await this.userService.createUser(signupDto);
      if (!user) {
        throw new HttpException('회원가입 실패', HttpStatus.BAD_REQUEST);
      }
      return {
        message: '회원가입 성공',
        user,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
