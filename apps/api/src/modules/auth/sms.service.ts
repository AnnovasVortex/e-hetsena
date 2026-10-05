import { Injectable, Logger } from '@nestjs/common';

export interface SmsProvider {
  send(phoneNumber: string, message: string): Promise<boolean>;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  /**
   * Envoie le code SMS de vérification.
   * En mode développement : Affiche le code dans la console NestJS.
   * En mode production : Appelle la passerelle SMS (Orange API, Twilio, etc.).
   */
  async sendOtp(phoneNumber: string, code: string): Promise<boolean> {
    const message = `Kaody e-hetsena anao: ${code}. Aza omena olona ity kaody ity. (Valable 5 minutes)`;
    const isDev = process.env.NODE_ENV !== 'production';
    const hasGateway = !!process.env.SMS_GATEWAY_URL;

    // Sans passerelle configurée, le code est écrit dans les logs (s'arrête dès que SMS_GATEWAY_URL est défini)
    if (isDev || !hasGateway) {
      if (!isDev) {
        // Une seule ligne par code, filtrable dans Cloud Logging (deploy/otp-logs.ps1)
        this.logger.warn(`[OTP TEST] ${phoneNumber} => ${code} (SMS_GATEWAY_URL absent, valable 5 min)`);
        return true;
      }
      this.logger.warn('=============================================');
      this.logger.warn(`📱 [SIMULATION SMS MADAGASCAR]`);
      this.logger.warn(`Destinataire : ${phoneNumber}`);
      this.logger.warn(`Code OTP     : >>> ${code} <<<`);
      this.logger.warn(`Message      : "${message}"`);
      this.logger.warn('=============================================');
      return true;
    }

    try {
      // Intégration passerelle SMS en production (Ex: Twilio ou passerelle HTTP locale)
      if (process.env.SMS_GATEWAY_URL) {
        const response = await fetch(process.env.SMS_GATEWAY_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SMS_GATEWAY_API_KEY}`,
          },
          body: JSON.stringify({
            to: phoneNumber,
            text: message,
          }),
        });
        return response.ok;
      }

      this.logger.log(`SMS envoyé avec succès à ${phoneNumber}`);
      return true;
    } catch (error) {
      this.logger.error(`Échec lors de l'envoi du SMS à ${phoneNumber}: ${error.message}`);
      return false;
    }
  }
}
