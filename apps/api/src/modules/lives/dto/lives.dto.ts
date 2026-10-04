import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLiveDto {
  @IsNotEmpty({ message: 'Titre du live requis' })
  @IsString()
  title: string;

  @IsOptional()
  scheduledStart?: string;

  @IsArray()
  @IsString({ each: true })
  articleIds: string[]; // Liste des articles qui seront présentés pendant le live
}

export class PinProductDto {
  @IsNotEmpty()
  @IsString()
  liveProductId: string;
}

export class FlashOrderDto {
  @IsNotEmpty()
  @IsString()
  liveProductId: string;
}

export class LiveChatMessageDto {
  @IsNotEmpty()
  @IsString()
  message: string;
}
