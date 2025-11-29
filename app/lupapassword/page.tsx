'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Phone, Lock, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Step = 'input-phone' | 'reset-password';

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>('input-phone');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nomor_hp: '',
    verification_code: '',
    new_password: '',
    konfirmasi_password: '',
  });

  const API_BASE_URL = 'http://localhost:3000';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Hanya angka
    
    // Format untuk display (0xxxxxxxxxx)
    if (value.startsWith('62')) {
      value = '0' + value.slice(2);
    }
    
    setFormData(prev => ({
      ...prev,
      nomor_hp: value
    }));
  };

  // Step 1: Request reset password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validasi nomor HP
    if (!formData.nomor_hp) {
      toast.error('❌ Harap masukkan nomor WhatsApp');
      setIsLoading(false);
      return;
    }

    if (formData.nomor_hp.length < 10) {
      toast.error('❌ Nomor HP minimal 10 digit');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nomor_hp: formData.nomor_hp
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('✅ Kode verifikasi telah dikirim ke WhatsApp Anda');
        setStep('reset-password');
      } else {
        toast.error(data.message || '❌ Gagal mengirim kode verifikasi');
      }
    } catch (error) {
      toast.error('🔌 Koneksi ke server gagal');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Reset password dengan kode verifikasi
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validasi kode verifikasi 6 digit
    if (formData.verification_code.length !== 6) {
      toast.error('❌ Kode verifikasi harus 6 digit');
      setIsLoading(false);
      return;
    }

    // Validasi password
    if (formData.new_password.length < 6) {
      toast.error('❌ Password minimal 6 karakter');
      setIsLoading(false);
      return;
    }

    // Validasi konfirmasi password
    if (formData.new_password !== formData.konfirmasi_password) {
      toast.error('❌ Konfirmasi password tidak sesuai');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verification_code: formData.verification_code,
          new_password: formData.new_password,
          konfirmasi_password: formData.konfirmasi_password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('✅ Password berhasil direset! Mengalihkan...');
        // Redirect ke login setelah 2 detik
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        toast.error(data.message || '❌ Gagal reset password');
      }
    } catch (error) {
      toast.error('🔌 Koneksi ke server gagal');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressSteps = () => {
    const steps = [
      { key: 'input-phone', label: 'Input Nomor', icon: Phone },
      { key: 'reset-password', label: 'Reset Password', icon: Lock },
    ];

    return steps.map((stepItem, index) => {
      const isActive = step === stepItem.key;
      const isCompleted = 
        stepItem.key === 'input-phone' && step === 'reset-password';

      return (
        <div key={stepItem.key} className="flex flex-col items-center flex-1">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            isCompleted 
              ? 'bg-green-500 text-white' 
              : isActive 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-500'
          }`}>
            {isCompleted ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <stepItem.icon className="w-5 h-5" />
            )}
          </div>
          <span className={`text-xs mt-2 font-medium ${
            isActive || isCompleted ? 'text-blue-600' : 'text-gray-500'
          }`}>
            {stepItem.label}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-50" suppressHydrationWarning>
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="rounded-xl shadow-lg"
        bodyClassName="font-medium"
      />

      {/* Left Side - Background Image */}
      <div 
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: 'url(/bg_aula.png)',
        }}
      >
        {/* Overlay gradient untuk teks */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-blue-700/60"></div>
        
        {/* Welcome Text */}
        <div className="relative z-10 flex flex-col justify-start p-12 text-white mt-16">
          <div className="max-w-md">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-28 h-28 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl border border-white/20">
                <img 
                  src="/logo_bbpmp.png" 
                  alt="BBPMP Logo" 
                  className="w-20 h-20 object-contain"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">BBPMP</h2>
                <p className="text-blue-100 text-sm font-medium">Balai Besar Penjamin Mutu Pendidikan Provinsi Jawa Barat</p>
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Reset <span className="text-blue-200 block">Password</span>
            </h1>
            <p className="text-lg text-blue-100 leading-relaxed">
              Ikuti langkah-langkah untuk mengatur ulang password akun Nyurat-Keun Anda.
            </p>
            
            {/* Feature List */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-400/20 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-200" />
                </div>
                <span className="text-blue-100">Proses aman dan terverifikasi</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-400/20 rounded-full flex items-center justify-center">
                  <Phone className="w-4 h-4 text-blue-200" />
                </div>
                <span className="text-blue-100">Kode dikirim via WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Reset Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl border border-blue-100">
              <img 
                src="/logo_bbpmp.png" 
                alt="BBPMP Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>

          {/* Card Container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/60 p-8 transform transition-all duration-300 hover:shadow-2xl">
            {/* Back Button */}
            <div className="mb-6">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-all duration-200 group"
              >
                <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                Kembali ke Login
              </Link>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="lg:hidden mb-4">
                <h2 className="text-xl font-bold text-gray-800">BBPMP</h2>
                <p className="text-gray-600 text-sm">Balai Besar Pengembangan Media Pendidikan</p>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Lupa Password
              </h1>
              <p className="text-gray-600 mt-3 font-medium">
                Ikuti {step === 'input-phone' ? '2' : '1'} langkah untuk reset password
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex justify-between items-center mb-8 px-4">
              {getProgressSteps()}
            </div>

            {/* Step 1: Input Phone Number */}
            {step === 'input-phone' && (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="nomor_hp" className="text-sm font-semibold text-gray-800">
                    Nomor WhatsApp Terdaftar
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform duration-200 group-focus-within:scale-110">
                      <Phone className="h-5 w-5 text-blue-500" />
                    </div>
                    <input
                      type="tel"
                      id="nomor_hp"
                      name="nomor_hp"
                      value={formData.nomor_hp}
                      onChange={handlePhoneChange}
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-white/70 border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 shadow-sm text-gray-900 font-medium hover:border-blue-300 focus:bg-white"
                      placeholder="081234567890"
                      pattern="08[0-9]{8,11}"
                      maxLength={13}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    Kode verifikasi akan dikirim via WhatsApp ke nomor ini.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:shadow-md group"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-medium">Mengirim Kode...</span>
                    </>
                  ) : (
                    <>
                      <span className="font-medium">Kirim Kode Verifikasi</span>
                      <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 2: Reset Password */}
            {step === 'reset-password' && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="verification_code" className="text-sm font-semibold text-gray-800">
                    Kode Verifikasi 6 Digit
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform duration-200 group-focus-within:scale-110">
                      <Shield className="h-5 w-5 text-blue-500" />
                    </div>
                    <input
                      type="text"
                      id="verification_code"
                      name="verification_code"
                      value={formData.verification_code}
                      onChange={handleInputChange}
                      required
                      maxLength={6}
                      className="w-full pl-11 pr-4 py-3.5 bg-white/70 border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 shadow-sm text-gray-900 font-medium hover:border-blue-300 focus:bg-white text-center tracking-widest text-lg"
                      placeholder="123456"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    Masukkan 6 digit kode yang dikirim ke WhatsApp Anda.
                  </p>
                </div>

                <div className="space-y-3">
                  <label htmlFor="new_password" className="text-sm font-semibold text-gray-800">
                    Password Baru
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform duration-200 group-focus-within:scale-110">
                      <Lock className="h-5 w-5 text-blue-500" />
                    </div>
                    <input
                      type="password"
                      id="new_password"
                      name="new_password"
                      value={formData.new_password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                      className="w-full pl-11 pr-4 py-3.5 bg-white/70 border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 shadow-sm text-gray-900 font-medium hover:border-blue-300 focus:bg-white"
                      placeholder="Masukkan password baru"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label htmlFor="konfirmasi_password" className="text-sm font-semibold text-gray-800">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform duration-200 group-focus-within:scale-110">
                      <Lock className="h-5 w-5 text-blue-500" />
                    </div>
                    <input
                      type="password"
                      id="konfirmasi_password"
                      name="konfirmasi_password"
                      value={formData.konfirmasi_password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                      className="w-full pl-11 pr-4 py-3.5 bg-white/70 border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 shadow-sm text-gray-900 font-medium hover:border-blue-300 focus:bg-white"
                      placeholder="Konfirmasi password baru"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:shadow-md group"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-medium">Mereset Password...</span>
                    </>
                  ) : (
                    <>
                      <span className="font-medium">Reset Password</span>
                      <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm font-medium">
              © 2025 BBPMP - Nyurat-Keun. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}