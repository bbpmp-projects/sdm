'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Clock, RotateCcw } from 'lucide-react';

export default function Verifikasi() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [kodeVerifikasi, setKodeVerifikasi] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const API_BASE_URL = 'http://localhost:3000';

  useEffect(() => {
    // Ambil email dari sessionStorage
    const savedEmail = sessionStorage.getItem('verification_email');
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      // Jika tidak ada email, redirect kembali ke register
      router.push('/register');
    }
  }, [router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const focusNextInput = (index: number) => {
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const focusPrevInput = (index: number) => {
    if (index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleInputChange = (index: number, value: string) => {
    // Hanya menerima angka
    if (!/^\d*$/.test(value)) return;

    const newKode = [...kodeVerifikasi];
    newKode[index] = value;
    setKodeVerifikasi(newKode);

    // Auto focus ke input berikutnya
    if (value !== '' && index < 5) {
      focusNextInput(index);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && kodeVerifikasi[index] === '' && index > 0) {
      focusPrevInput(index);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusPrevInput(index);
    } else if (e.key === 'ArrowRight' && index < 5) {
      focusNextInput(index);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const numbers = pastedData.replace(/\D/g, '').slice(0, 6);
    
    const newKode = [...kodeVerifikasi];
    numbers.split('').forEach((char, index) => {
      if (index < 6) {
        newKode[index] = char;
      }
    });
    
    setKodeVerifikasi(newKode);
    
    // Focus ke input terakhir yang terisi
    const lastFilledIndex = Math.min(numbers.length - 1, 5);
    if (lastFilledIndex < 5) {
      inputRefs.current[lastFilledIndex + 1]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifikasi = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const kode = kodeVerifikasi.join('');
    if (kode.length !== 6) {
      setMessage('❌ Masukkan 6 digit kode verifikasi');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verification_code: kode,
          alamat_email: email
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('🎉 Verifikasi berhasil! Mengarahkan ke dashboard...');
        
        // Hapus email dari sessionStorage
        sessionStorage.removeItem('verification_email');
        
        // Simpan token atau data user ke localStorage/sessionStorage jika diperlukan
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
          sessionStorage.setItem('auth_token', data.token);
        }
        
        if (data.user) {
          localStorage.setItem('user_data', JSON.stringify(data.user));
          sessionStorage.setItem('user_data', JSON.stringify(data.user));
        }
        
        // Redirect ke halaman dashboard setelah 2 detik
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setMessage(data.message || '❌ Kode verifikasi tidak valid');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setMessage('🔌 Koneksi ke server gagal. Periksa koneksi internet Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          alamat_email: email 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('📧 Kode verifikasi baru telah dikirim ke email Anda');
        setCountdown(60); // 60 detik countdown
      } else {
        setMessage(data.message || '❌ Gagal mengirim ulang kode verifikasi');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setMessage('🔌 Koneksi ke server gagal');
    } finally {
      setIsResending(false);
    }
  };

  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split('@');
    const maskedLocal = localPart.length > 2 
      ? localPart.substring(0, 2) + '*'.repeat(localPart.length - 2)
      : localPart;
    return `${maskedLocal}@${domain}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <Link 
          href="/register"
          className="absolute -top-16 left-0 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors mb-4 font-medium group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
          Kembali ke pendaftaran
        </Link>

        {/* Card Container */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/60 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center shadow-lg border border-blue-200 mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Verifikasi Email
            </h1>
            <p className="text-gray-600 mt-3 font-medium">
              Kami telah mengirim kode verifikasi 6 digit ke
            </p>
            <p className="text-blue-600 font-semibold mt-1">
              {maskEmail(email)}
            </p>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleVerifikasi} className="space-y-6">
            {/* Kode Verifikasi Input */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700 text-center block">
                Masukkan 6 digit kode verifikasi
              </label>
              
              <div className="flex justify-center gap-3">
                {kodeVerifikasi.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-xl font-semibold bg-white border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm"
                    required
                  />
                ))}
              </div>
            </div>

            {/* Countdown dan Resend */}
            <div className="text-center">
              {countdown > 0 ? (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Kirim ulang dalam {countdown} detik</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50 inline-flex items-center gap-2 font-medium group"
                >
                  <RotateCcw className="w-4 h-4" />
                  {isResending ? 'Mengirim...' : 'Kirim ulang kode'}
                </button>
              )}
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-xl text-sm font-medium transform transition-all duration-300 ${
                message.includes('berhasil') || message.includes('🎉') || message.includes('📧')
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || kodeVerifikasi.join('').length !== 6}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:shadow"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Verifikasi</span>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center pt-6 border-t border-blue-100">
            <p className="text-gray-700 font-medium">
              Sudah punya akun?{' '}
              <Link 
                href="/" 
                className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm font-medium">
            © 2025 BBPMP - Nyurat-Keun. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}