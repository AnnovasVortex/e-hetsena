import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateVideoUploadDto {
  @IsOptional()
  @IsString()
  articleId?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(5, { message: 'La vidéo doit durer au moins 5 secondes' })
  @Max(65, { message: 'La vidéo ne peut pas dépasser 60 secondes' })
  durationSeconds: number;

  @IsNotEmpty()
  @IsString()
  thumbnailUrl: string;
}

export class CreateCommentDto {
  @IsNotEmpty({ message: 'Hafatra foana (Commentaire vide)' })
  @IsString()
  @MaxLength(300, { message: 'Commentaire trop long (max 300 caractères)' })
  content: string;
}
