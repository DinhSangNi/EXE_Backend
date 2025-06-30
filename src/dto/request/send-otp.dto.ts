import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({
    description: 'Địa chỉ email người dùng',
    example: 'example@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
