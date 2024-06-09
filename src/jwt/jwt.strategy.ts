import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenType } from './enum/token.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true, //false로 하면 passport 가 자동으로 예외 처리
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    if (payload.exp * 1000 < Date.now()) {
      if (payload.tokenType === TokenType.ACCESS) {
        throw new UnauthorizedException(
          'accessToken이 만료되었습니다. refreshToken을 보내주세요.',
        );
      }

      if (payload.tokenType === TokenType.REFRESH) {
        throw new UnauthorizedException(
          '토큰이 모두 만료되었습니다. 로그인을 다시 해주십시오.',
        );
      }
    }
    return {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
    };
  }
}
