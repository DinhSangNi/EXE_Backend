import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsArray,
  IsUrl,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  categoryId: string;

  @IsString()
  city: string;

  @IsString()
  district: string;

  @IsOptional()
  @IsString()
  ward?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  square: number;

  @IsNumber()
  price: number;

  @IsString()
  @IsUrl()
  @IsOptional()
  url?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  mediaIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  amenityIds?: string[];
}
