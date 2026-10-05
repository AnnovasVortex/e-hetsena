import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Anarana fohy loatra (Nom trop court)' })
  @MaxLength(60)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Veuillez préciser votre ville' })
  @MaxLength(60)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  bio?: string;
}
