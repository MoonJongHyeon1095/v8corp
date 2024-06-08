import { Injectable } from '@nestjs/common';
import { SignupDto, SignupResponseDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';
import { ValidatedUserDto } from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dto/login.dto';
import { Role } from './enum/role.enum';
@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}
  async createUser(signupDto: SignupDto): Promise<SignupResponseDto | null> {
    try {
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
      }
      return null;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
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
      };
    }
    return null;
  }

  async login(user: ValidatedUserDto): Promise<LoginResponseDto> {
    const payload = { username: user.username, sub: user.userId };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '60m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}
