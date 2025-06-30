import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    description: 'Email đăng nhập của người dùng',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Mật khẩu đăng nhập',
    example: 'yourStrongPassword123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
