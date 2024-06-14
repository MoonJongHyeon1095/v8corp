import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto, SignupResponseDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';
import { ValidatedUserDto } from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dto/login.dto';
import { Role } from './enum/role.enum';
import { TokenType } from '.././jwt/enum/token.enum';
import { RefreshResponseDto } from './dto/refresh.dto';
@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}
  async createUser(signupDto: SignupDto): Promise<SignupResponseDto> {
    await this.validateDuplicateUser(signupDto.username);
    const hashedPassword = await bcrypt.hash(signupDto.password, 10);

    const newUser = await this.userRepository.createUser(
      signupDto.username,
      hashedPassword,
      Role.NORMAL,
    );
    if (newUser) {
      return {
        userId: newUser.userId,
        username: newUser.username,
      } as SignupResponseDto;
    } else {
      throw new InternalServerErrorException('회원가입 오류');
    }
  }

  async validateUser(
    username: string,
    password: string,
  ): Promise<ValidatedUserDto | null> {
    const user = await this.userRepository.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      return {
        userId: user.userId,
        username: user.username,
        role: user.role,
      };
    } else {
      throw new UnauthorizedException('인증정보가 올바르지 않습니다.');
    }
  }

  async login(user: ValidatedUserDto): Promise<LoginResponseDto> {
    const accessPayload = {
      username: user.username,
      userId: user.userId,
      role: user.role,
      tokenType: TokenType.ACCESS,
    };
    const refreshPayload = {
      username: user.username,
      userId: user.userId,
      role: user.role,
      tokenType: TokenType.REFRESH,
    };
    const accessToken = `Bearer ${this.jwtService.sign(accessPayload, {
      expiresIn: '60m',
    })}`;
    const refreshToken = `Bearer ${this.jwtService.sign(refreshPayload, {
      expiresIn: '7d',
    })}`;

    await this.userRepository.updateRefreshToken(user.userId, refreshToken);
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async refresh(user: ValidatedUserDto): Promise<RefreshResponseDto> {
    const accessPayload = {
      username: user.username,
      userId: user.userId,
      role: user.role,
      tokenType: TokenType.ACCESS,
    };
    const refreshPayload = {
      username: user.username,
      userId: user.userId,
      role: user.role,
      tokenType: TokenType.REFRESH,
    };
    const accessToken = `Bearer ${this.jwtService.sign(accessPayload, {
      expiresIn: '60m',
    })}`;
    const refreshToken = `Bearer ${this.jwtService.sign(refreshPayload, {
      expiresIn: '7d',
    })}`;

    await this.userRepository.updateRefreshToken(user.userId, refreshToken);
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  private async validateDuplicateUser(username: string) {
    const user = await this.userRepository.findByUsername(username);
    if (user) {
      throw new ConflictException('중복된 username 입니다.');
    }
  }
}
