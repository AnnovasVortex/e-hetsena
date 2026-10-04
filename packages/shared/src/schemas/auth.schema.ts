import { z } from 'zod';

/**
 * Expression régulière pour valider les numéros malgaches :
 * Formats acceptés :
 * - Avec indicatif : +261341234567, +261321234567, +261331234567, +261381234567
 * - Sans indicatif : 0341234567, 0321234567, 0331234567, 0381234567
 */
export const MALAGASY_PHONE_REGEX = /^(?:\+261|0)(32|33|34|38)\d{7}$/;

/**
 * Normalise un numéro au format standard international E.164 (+2613XXXXXXXX)
 */
export function normalizeMalagasyPhone(phone: string): string {
  const cleaned = phone.replace(/[\s.-]/g, '');
  if (cleaned.startsWith('0')) {
    return `+261${cleaned.substring(1)}`;
  }
  if (!cleaned.startsWith('+')) {
    return `+${cleaned}`;
  }
  return cleaned;
}

/**
 * Détecte l'opérateur malgache pour afficher la bonne icône dans l'UI
 */
export function detectOperator(phone: string): 'TELMA' | 'ORANGE' | 'AIRTEL' | 'UNKNOWN' {
  const cleaned = phone.replace(/[\s.-]/g, '');
  const prefix = cleaned.startsWith('+261') 
    ? cleaned.substring(4, 6) 
    : cleaned.startsWith('0') 
    ? cleaned.substring(1, 3) 
    : '';

  if (prefix === '34' || prefix === '38') return 'TELMA';
  if (prefix === '32') return 'ORANGE';
  if (prefix === '33') return 'AIRTEL';
  return 'UNKNOWN';
}

export const SendOtpSchema = z.object({
  phoneNumber: z
    .string()
    .min(9, 'Laharana fohy loatra (Numéro trop court)')
    .regex(MALAGASY_PHONE_REGEX, 'Laharana tsy manankery (Format invalide. Ex: 034 12 345 67)'),
});

export const VerifyOtpSchema = z.object({
  phoneNumber: z
    .string()
    .regex(MALAGASY_PHONE_REGEX, 'Format de numéro invalide'),
  code: z
    .string()
    .length(6, 'Ny kaody dia tarehimarika 6 (Le code doit comporter 6 chiffres)')
    .regex(/^\d+$/, 'Chiffres uniquement'),
  fullName: z.string().min(2, 'Nom trop court').optional(),
  city: z.string().min(2, 'Veuillez préciser votre ville').optional(),
});

export type SendOtpInput = z.infer<typeof SendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
