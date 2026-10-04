'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhoneStep } from '@/components/auth/PhoneStep';
import { OtpStep } from '@/components/auth/OtpStep';
import { ProfileCompletionModal } from '@/components/auth/ProfileCompletionModal';

type AuthStep = 'PHONE' | 'OTP' | 'PROFILE_COMPLETION';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Envoi du SMS OTP
  const handleSendPhone = async (phone: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Tsy nahomby ny fandefasana kaody (Erreur lors de l'envoi)");
      }

      setPhoneNumber(phone);
      setStep('OTP');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Vérification du code OTP
  const handleVerifyOtp = async (code: string) => {
    setIsLoading(true);
    setError(null);
    setOtpCode(code);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, code }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Kaody diso na lany daty (Code invalide ou expiré)');
      }

      // Sauvegarde des tokens de session
      localStorage.setItem('ehetsena_token', data.tokens.accessToken);
      localStorage.setItem('ehetsena_refresh', data.tokens.refreshToken);
      localStorage.setItem('ehetsena_user', JSON.stringify(data.user));

      // Si nouvel utilisateur sans nom configuré -> Compléter le profil
      if (data.isNewUser) {
        setStep('PROFILE_COMPLETION');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Finalisation du profil
  const handleCompleteProfile = async (fullName: string, city: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('ehetsena_token');
      await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName, city }),
      });

      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#12181B] flex flex-col justify-center items-center px-4 py-8">
      {step === 'PHONE' && (
        <PhoneStep
          onSuccess={handleSendPhone}
          isLoading={isLoading}
          error={error}
        />
      )}

      {step === 'OTP' && (
        <OtpStep
          phoneNumber={phoneNumber}
          onVerify={handleVerifyOtp}
          onResend={() => handleSendPhone(phoneNumber)}
          onBack={() => {
            setError(null);
            setStep('PHONE');
          }}
          isLoading={isLoading}
          error={error}
        />
      )}

      {step === 'PROFILE_COMPLETION' && (
        <ProfileCompletionModal
          onSubmit={handleCompleteProfile}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
