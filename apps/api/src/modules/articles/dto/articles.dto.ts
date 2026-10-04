import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ItemCondition, DeliveryMethod } from '@prisma/client';

export class CreateArticleDto {
  @IsNotEmpty({ message: 'Titre requis' })
  @IsString()
  title: string;

  @IsNotEmpty({ message: 'Description requise' })
  @IsString()
  description: string;

  @IsInt()
  @Min(500, { message: 'Prix minimum 500 Ariary' })
  @Max(100000000)
  price: number;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsEnum(ItemCondition)
  condition: ItemCondition;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsArray()
  @IsEnum(DeliveryMethod, { each: true })
  deliveryOptions: DeliveryMethod[];

  @IsOptional()
  @IsBoolean()
  isWhatsAppContactEnabled?: boolean;

  @IsArray()
  @IsString({ each: true })
  imageUrls: string[];
}

export class QueryArticlesDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  minPrice?: string;

  @IsOptional()
  maxPrice?: string;

  @IsOptional()
  page?: string;

  @IsOptional()
  limit?: string;
}
