import { IsString, Length } from 'class-validator';

export class SignupDto {
  @IsString()
  @Length(4, 20)
  username: string;

  @IsString()
  @Length(8, 20)
  password: string;
}

export class SignupResponseDto {
  userId: number;
  username: string;
}
