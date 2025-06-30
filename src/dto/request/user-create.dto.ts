import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  max,
} from 'class-validator';
import { UserRole } from 'src/user/user-role.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  @Length(10)
  phone: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be one of: user, admin' })
  role: UserRole = UserRole.USER;

  @IsOptional()
  @IsString()
  avatar?: string;
}
