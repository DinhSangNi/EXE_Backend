import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  max,
} from 'class-validator';
import { UserRole } from 'src/user/user-role.enum';

export class GoogleCreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  @Length(10)
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be one of: host, admin, renter' })
  role?: UserRole = UserRole.RENTER;

  @IsOptional()
  @IsString()
  avatar?: string;
}
