import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsService } from './sms.service';
import { SendOtpDto, VerifyOtpDto } from './dto/auth.dto';
import { normalizeMalagasyPhone } from '@e-hetsena/shared';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Hachage sécurisé du code OTP avec SHA-256
   */
  private hashOtp(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  /**
   * 1. Demande d'envoi du code OTP par SMS
   */
  async sendOtp(dto: SendOtpDto) {
    const normalizedPhone = normalizeMalagasyPhone(dto.phoneNumber);

    // Protection anti-spam : Vérifie si un code a été demandé il y a moins de 60 secondes
    const recentOtp = await this.prisma.otpVerification.findFirst({
      where: {
        phoneNumber: normalizedPhone,
        createdAt: {
          gte: new Date(Date.now() - 60 * 1000), // Moins d'une minute
        },
      },
    });

    if (recentOtp) {
      throw new HttpException(
        'Miandrasa 1 minitra vao mangataka kaody vaovao (Veuillez patienter 1 minute avant de redemander un code)',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Génération d'un code aléatoire à 6 chiffres
    const rawCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = this.hashOtp(rawCode);

    // Sauvegarde en base avec expiration à 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.otpVerification.create({
      data: {
        phoneNumber: normalizedPhone,
        codeHash,
        expiresAt,
      },
    });

    // Envoi effectif par SMS (ou log en dev)
    await this.smsService.sendOtp(normalizedPhone, rawCode);

    return {
      success: true,
      message: 'Kaody nalefa soa aman-tsara (Code SMS envoyé avec succès)',
      expiresInSeconds: 300,
    };
  }

  /**
   * 2. Vérification du code OTP et connexion / inscription automatique
   */
  async verifyOtp(dto: VerifyOtpDto) {
    const normalizedPhone = normalizeMalagasyPhone(dto.phoneNumber);
    const hashedInput = this.hashOtp(dto.code);

    // Récupérer le dernier code OTP valide et non consommé
    const otpRecord = await this.prisma.otpVerification.findFirst({
      where: {
        phoneNumber: normalizedPhone,
        consumed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('Kaody efa lany daty na tsy misy (Code expiré ou inexistant)');
    }

    // Blocage après 5 tentatives infructueuses
    if (otpRecord.attempts >= 5) {
      throw new UnauthorizedException('Kaody voasakana noho ny fanandramana diso maro (Trop de tentatives erronées)');
    }

    // Vérification de la correspondance du code haché
    if (otpRecord.codeHash !== hashedInput) {
      await this.prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('Kaody diso (Code SMS incorrect)');
    }

    // Marquer l'OTP comme consommé pour qu'il ne serve qu'une seule fois
    await this.prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { consumed: true },
    });

    // Rechercher si l'utilisateur existe déjà
    let user = await this.prisma.user.findUnique({
      where: { phoneNumber: normalizedPhone },
    });

    const isNewUser = !user;

    // Si nouvel utilisateur : Création du compte
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phoneNumber: normalizedPhone,
          phoneVerified: true,
          fullName: dto.fullName?.trim() || `Mpampiasa_${normalizedPhone.slice(-4)}`,
          city: dto.city?.trim() || 'Antananarivo',
        },
      });
    } else if (!user.phoneVerified) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true },
      });
    }

    // Génération des JWT
    const tokens = await this.generateTokens(user.id, user.role);

    return {
      isNewUser,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        city: user.city,
        role: user.role,
        avatarUrl: user.avatarUrl,
        trustScore: user.trustScore,
      },
      tokens,
    };
  }

  /**
   * 3. Renouvellement de l'Access Token via Refresh Token
   */
  async refreshSession(refreshTokenStr: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshTokenStr },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expirée, veuillez vous reconnecter');
    }

    // Rotation du Refresh Token pour une sécurité maximale
    await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });

    const tokens = await this.generateTokens(tokenRecord.user.id, tokenRecord.user.role);
    return tokens;
  }

  /**
   * Génère les tokens d'accès (court 15m) et de rafraîchissement (30j)
   */
  private async generateTokens(userId: string, role: string) {
    const payload = { sub: userId, role };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: refreshExpiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 900 secondes
    };
  }
}
