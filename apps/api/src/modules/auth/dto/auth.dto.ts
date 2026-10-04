import { IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';
import { MALAGASY_PHONE_REGEX } from '@e-hetsena/shared';

export class SendOtpDto {
  @IsNotEmpty({ message: 'Laharana finday takiana (Numéro de téléphone requis)' })
  @Matches(MALAGASY_PHONE_REGEX, {
    message: 'Laharana tsy manankery (Ex: 0341234567, 0321234567 ou +261331234567)',
  })
  phoneNumber: string;
}

export class VerifyOtpDto {
  @IsNotEmpty()
  @Matches(MALAGASY_PHONE_REGEX, { message: 'Numéro de téléphone invalide' })
  phoneNumber: string;

  @IsNotEmpty({ message: 'Kaody 6 isa takiana (Code à 6 chiffres requis)' })
  @Length(6, 6, { message: 'Ny kaody dia tokony ho 6 isa (Le code doit avoir 6 chiffres)' })
  code: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  city?: string;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
