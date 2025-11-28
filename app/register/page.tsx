'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone, IdCard, Building, MapPin, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showKonfirmasiPassword, setShowKonfirmasiPassword] = useState(false);
  const [formData, setFormData] = useState({
    nomor_ktp_nisn: '',
    nomor_hp: '',
    password: '',
    konfirmasi_password: '',
    jenis_instansi: '',
    provinsi_instansi: '',
    nama_sesuai_ktp: '',
    alamat_email: '',
    nama_instansi: '',
    kabupaten_kota_instansi: ''
  });

  const [errors, setErrors] = useState({
    nomor_ktp_nisn: '',
    nomor_hp: '',
    password: '',
    konfirmasi_password: ''
  });

  const API_BASE_URL = 'http://localhost:3000';

  // Validasi konfirmasi password
  const validatePasswordMatch = useCallback((password: string, konfirmasi_password: string) => {
    if (password && konfirmasi_password && password !== konfirmasi_password) {
      return 'Password dan konfirmasi password tidak sama';
    }
    return '';
  }, []);

  // Validasi input KTP (hanya angka, harus tepat 16 digit)
  const handleKtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Hapus semua karakter non-digit
    value = value.replace(/\D/g, '');
    
    // Potong menjadi 16 digit
    value = value.slice(0, 16);
    
    setFormData(prev => ({
      ...prev,
      nomor_ktp_nisn: value
    }));

    // Validasi real-time - KTP harus tepat 16 digit
    if (value.length > 0 && value.length !== 16) {
      setErrors(prev => ({
        ...prev,
        nomor_ktp_nisn: 'Nomor KTP harus 16 digit'
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        nomor_ktp_nisn: ''
      }));
    }
  };

  // Validasi input nomor HP (hanya angka, maksimal 13 digit)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Hapus semua karakter non-digit
    value = value.replace(/\D/g, '');
    
    // Potong menjadi 13 digit
    value = value.slice(0, 13);
    
    setFormData(prev => ({
      ...prev,
      nomor_hp: value
    }));

    // Validasi real-time - Nomor HP maksimal 13 digit (boleh kurang)
    if (value.length > 0 && value.length > 13) {
      setErrors(prev => ({
        ...prev,
        nomor_hp: 'Nomor HP maksimal 13 digit'
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        nomor_hp: ''
      }));
    }
  };

  // Handle paste event untuk mencegah paste lebih dari batas
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, maxLength: number) => {
    const pastedData = e.clipboardData.getData('text');
    if (pastedData.replace(/\D/g, '').length > maxLength) {
      e.preventDefault();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [name]: value
      };

      // Validasi konfirmasi password setelah state ter-update
      setTimeout(() => {
        if (name === 'password' || name === 'konfirmasi_password') {
          const passwordError = validatePasswordMatch(newFormData.password, newFormData.konfirmasi_password);
          setErrors(prevErrors => ({
            ...prevErrors,
            konfirmasi_password: passwordError
          }));
        }
      }, 0);

      return newFormData;
    });
  };

  const validateForm = () => {
    const newErrors = {
      nomor_ktp_nisn: '',
      nomor_hp: '',
      password: '',
      konfirmasi_password: ''
    };

    let isValid = true;

    // Validasi KTP - harus tepat 16 digit
    if (formData.nomor_ktp_nisn.length !== 16) {
      newErrors.nomor_ktp_nisn = 'Nomor KTP harus 16 digit';
      isValid = false;
    }

    // Validasi nomor HP - maksimal 13 digit (boleh kurang)
    if (formData.nomor_hp.length > 13) {
      newErrors.nomor_hp = 'Nomor HP maksimal 13 digit';
      isValid = false;
    }

    // Validasi nomor HP minimal
    if (formData.nomor_hp.length < 10) {
      newErrors.nomor_hp = 'Nomor HP minimal 10 digit';
      isValid = false;
    }

    // Validasi password
    if (formData.password.length < 8) {
      newErrors.password = 'Password minimal 8 karakter';
      isValid = false;
    }

    // Validasi konfirmasi password
    const passwordMatchError = validatePasswordMatch(formData.password, formData.konfirmasi_password);
    if (passwordMatchError) {
      newErrors.konfirmasi_password = passwordMatchError;
      isValid = false;
    }

    // Validasi email
    if (!formData.alamat_email) {
      isValid = false;
    }

    // Validasi nama
    if (!formData.nama_sesuai_ktp) {
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage('❌ Harap perbaiki error pada form sebelum submit');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const payload = {
        nomor_ktp_nisn: formData.nomor_ktp_nisn,
        nomor_hp: formData.nomor_hp,
        password: formData.password,
        konfirmasi_password: formData.konfirmasi_password,
        jenis_instansi: formData.jenis_instansi || '',
        provinsi_instansi: formData.provinsi_instansi || '',
        nama_sesuai_ktp: formData.nama_sesuai_ktp,
        alamat_email: formData.alamat_email,
        nama_instansi: formData.nama_instansi || '',
        kabupaten_kota_instansi: formData.kabupaten_kota_instansi || ''
      };

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('🎉 Registrasi berhasil! Mengarahkan ke halaman verifikasi...');
        
        // Simpan email ke sessionStorage untuk digunakan di halaman verifikasi
        sessionStorage.setItem('verification_email', formData.alamat_email);
        
        // Redirect ke halaman verifikasi setelah 2 detik
        setTimeout(() => {
          router.push('/register/verifikasi');
        }, 2000);
        
      } else {
        const errorMessage = data.message || data.error || '❌ Gagal melakukan registrasi';
        setMessage(errorMessage);
        
        if (data.message?.includes('duplicate') || data.message?.includes('sudah ada')) {
          if (data.message.includes('alamat_email')) {
            setMessage('❌ Email sudah terdaftar');
          } else if (data.message.includes('nomor_ktp_nisn')) {
            setMessage('❌ Nomor KTP/NISN sudah terdaftar');
          }
        }

        if (data.errors && data.errors.length > 0) {
          setMessage(`❌ ${data.errors.join(', ')}`);
        }
      }
    } catch (error) {
      setMessage('🔌 Koneksi ke server gagal. Periksa koneksi internet Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.alamat_email) {
      setMessage('❌ Masukkan email terlebih dahulu');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.alamat_email }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('📧 Email verifikasi telah dikirim ulang');
      } else {
        setMessage(data.message || '❌ Gagal mengirim ulang verifikasi');
      }
    } catch (error) {
      setMessage('🔌 Koneksi ke server gagal');
    } finally {
      setIsLoading(false);
    }
  };

  const jenisInstansiOptions = [
    'Sekolah',
    'Perguruan Tinggi',
    'Dinas Pendidikan',
    'Lembaga Pelatihan',
    'Lainnya'
  ];

  const provinsiOptions = [
    'DKI Jakarta',
    'Jawa Barat',
    'Jawa Tengah',
    'Jawa Timur',
    'Banten',
    'DI Yogyakarta',
    'Sumatera Utara',
    'Sumatera Barat',
    'Riau',
    'Lainnya'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-6xl">
        {/* Back Button */}
        <Link 
          href="/"
          className="absolute -top-16 left-0 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors mb-4 font-medium group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
          Kembali ke halaman login
        </Link>

        {/* Card Container */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/60 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6">
              <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-blue-100">
                <img 
                  src="/logo_bbpmp.png" 
                  alt="BBPMP Logo" 
                  className="w-20 h-20 object-contain"
                />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-800">BBPMP</h2>
                <p className="text-blue-600 text-lg font-semibold">Balai Besar Penjaminan Mutu Pendidikan</p>
                <p className="text-gray-600 text-base font-medium mt-1">Provinsi Jawa Barat</p>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Daftar Akun Baru
            </h1>
            <p className="text-gray-600 mt-3 font-medium max-w-2xl mx-auto">
              Lengkapi data diri Anda untuk bergabung dengan platform Nyurat-We
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              
              {/* Kolom Kiri - Data Pribadi & Keamanan */}
              <div className="space-y-6">
                {/* Data Pribadi */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Data Pribadi
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Nama Sesuai KTP */}
                    <div className="space-y-2">
                      <label htmlFor="nama_sesuai_ktp" className="text-sm font-medium text-gray-700">
                        Nama Sesuai KTP *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-blue-500" />
                        </div>
                        <input
                          type="text"
                          id="nama_sesuai_ktp"
                          name="nama_sesuai_ktp"
                          value={formData.nama_sesuai_ktp}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-11 pr-4 py-3 bg-white border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 shadow-sm"
                          placeholder="Masukkan nama lengkap sesuai KTP"
                        />
                      </div>
                    </div>

                    {/* Nomor KTP/NISN */}
                    <div className="space-y-2">
                      <label htmlFor="nomor_ktp_nisn" className="text-sm font-medium text-gray-700">
                        Nomor KTP *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <IdCard className="h-5 w-5 text-blue-500" />
                        </div>
                        <input
                          type="text"
                          id="nomor_ktp_nisn"
                          name="nomor_ktp_nisn"
                          value={formData.nomor_ktp_nisn}
                          onChange={handleKtpChange}
                          onPaste={(e) => handlePaste(e, 16)}
                          required
                          inputMode="numeric"
                          className={`w-full pl-11 pr-4 py-3 bg-white border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 shadow-sm ${
                            errors.nomor_ktp_nisn 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                              : 'border-blue-100'
                          }`}
                          placeholder="16 digit nomor KTP"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          {formData.nomor_ktp_nisn.length}/16 digit
                        </p>
                        {errors.nomor_ktp_nisn && (
                          <p className="text-xs text-red-600 font-medium">
                            {errors.nomor_ktp_nisn}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Nomor HP */}
                    <div className="space-y-2">
                      <label htmlFor="nomor_hp" className="text-sm font-medium text-gray-700">
                        Nomor HP *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-blue-500" />
                        </div>
                        <input
                          type="tel"
                          id="nomor_hp"
                          name="nomor_hp"
                          value={formData.nomor_hp}
                          onChange={handlePhoneChange}
                          onPaste={(e) => handlePaste(e, 13)}
                          required
                          inputMode="numeric"
                          className={`w-full pl-11 pr-4 py-3 bg-white border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 shadow-sm ${
                            errors.nomor_hp 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                              : 'border-blue-100'
                          }`}
                          placeholder="Contoh: 081234567890"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          {formData.nomor_hp.length}/13 digit
                        </p>
                        {errors.nomor_hp && (
                          <p className="text-xs text-red-600 font-medium">
                            {errors.nomor_hp}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label htmlFor="alamat_email" className="text-sm font-medium text-gray-700">
                        Alamat Email *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-blue-500" />
                        </div>
                        <input
                          type="email"
                          id="alamat_email"
                          name="alamat_email"
                          value={formData.alamat_email}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-11 pr-4 py-3 bg-white border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 shadow-sm"
                          placeholder="masukkan@email.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Keamanan Akun */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Keamanan Akun
                  </h3>

                  <div className="space-y-4">
                    {/* Password */}
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Password *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-blue-500" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          minLength={8}
                          className={`w-full pl-11 pr-12 py-3 bg-white border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 shadow-sm ${
                            errors.password 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                              : 'border-blue-100'
                          }`}
                          placeholder="Masukkan password (min. 8 karakter)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-blue-50 rounded-xl p-1 transition-all duration-200"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Eye className="h-5 w-5 text-blue-600" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-xs text-red-600 font-medium">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    {/* Konfirmasi Password */}
                    <div className="space-y-2">
                      <label htmlFor="konfirmasi_password" className="text-sm font-medium text-gray-700">
                        Konfirmasi Password *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-blue-500" />
                        </div>
                        <input
                          type={showKonfirmasiPassword ? "text" : "password"}
                          id="konfirmasi_password"
                          name="konfirmasi_password"
                          value={formData.konfirmasi_password}
                          onChange={handleInputChange}
                          required
                          className={`w-full pl-11 pr-12 py-3 bg-white border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 shadow-sm ${
                            errors.konfirmasi_password 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                              : 'border-blue-100'
                          }`}
                          placeholder="Konfirmasi password Anda"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKonfirmasiPassword(!showKonfirmasiPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-blue-50 rounded-xl p-1 transition-all duration-200"
                        >
                          {showKonfirmasiPassword ? (
                            <EyeOff className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Eye className="h-5 w-5 text-blue-600" />
                          )}
                        </button>
                      </div>
                      {errors.konfirmasi_password && (
                        <p className="text-xs text-red-600 font-medium">
                          {errors.konfirmasi_password}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan - Data Instansi */}
              <div className="space-y-6">
                {/* Data Instansi */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Data Instansi
                  </h3>

                  <div className="space-y-4">
                    {/* Nama Instansi */}
                    <div className="space-y-2">
                      <label htmlFor="nama_instansi" className="text-sm font-medium text-gray-700">
                        Nama Instansi
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Building className="h-5 w-5 text-blue-500" />
                        </div>
                        <input
                          type="text"
                          id="nama_instansi"
                          name="nama_instansi"
                          value={formData.nama_instansi}
                          onChange={handleInputChange}
                          className="w-full pl-11 pr-4 py-3 bg-white border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 shadow-sm"
                          placeholder="Nama instansi tempat bekerja"
                        />
                      </div>
                    </div>

                    {/* Jenis Instansi */}
                    <div className="space-y-2">
                      <label htmlFor="jenis_instansi" className="text-sm font-medium text-gray-700">
                        Jenis Instansi
                      </label>
                      <div className="relative group">
                        <select
                          id="jenis_instansi"
                          name="jenis_instansi"
                          value={formData.jenis_instansi}
                          onChange={handleInputChange}
                          className="w-full pl-3 pr-10 py-3 bg-white border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 shadow-sm appearance-none"
                        >
                          <option value="">Pilih Jenis Instansi</option>
                          {jenisInstansiOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <div className="w-2 h-2 border-r-2 border-b-2 border-blue-500 transform rotate-45 -translate-y-1"></div>
                        </div>
                      </div>
                    </div>

                    {/* Provinsi Instansi */}
                    <div className="space-y-2">
                      <label htmlFor="provinsi_instansi" className="text-sm font-medium text-gray-700">
                        Provinsi Instansi
                      </label>
                      <div className="relative group">
                        <select
                          id="provinsi_instansi"
                          name="provinsi_instansi"
                          value={formData.provinsi_instansi}
                          onChange={handleInputChange}
                          className="w-full pl-3 pr-10 py-3 bg-white border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 shadow-sm appearance-none"
                        >
                          <option value="">Pilih Provinsi</option>
                          {provinsiOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <div className="w-2 h-2 border-r-2 border-b-2 border-blue-500 transform rotate-45 -translate-y-1"></div>
                        </div>
                      </div>
                    </div>

                    {/* Kabupaten/Kota Instansi */}
                    <div className="space-y-2">
                      <label htmlFor="kabupaten_kota_instansi" className="text-sm font-medium text-gray-700">
                        Kabupaten/Kota Instansi
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-blue-500" />
                        </div>
                        <input
                          type="text"
                          id="kabupaten_kota_instansi"
                          name="kabupaten_kota_instansi"
                          value={formData.kabupaten_kota_instansi}
                          onChange={handleInputChange}
                          className="w-full pl-11 pr-4 py-3 bg-white border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 shadow-sm"
                          placeholder="Nama kabupaten/kota"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <div className="relative mt-1">
                      <input
                        type="checkbox"
                        required
                        className="w-5 h-5 text-blue-600 bg-white border-2 border-blue-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                      />
                    </div>
                    <span className="text-sm text-gray-700 leading-relaxed">
                      Saya menyetujui{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                        Syarat & Ketentuan
                      </a>{' '}
                      dan{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                        Kebijakan Privasi
                      </a>{' '}
                      platform Nyurat-We
                    </span>
                  </label>
                </div>

                {/* Resend Verification */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isLoading}
                    className="w-full text-sm text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2 font-medium group border border-blue-200 hover:border-blue-300 px-4 py-3 rounded-xl bg-blue-50 hover:bg-blue-100"
                  >
                    <Mail className="w-4 h-4" />
                    Kirim ulang email verifikasi
                  </button>
                </div>
              </div>
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
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isLoading || errors.nomor_ktp_nisn || errors.nomor_hp || errors.password || errors.konfirmasi_password}
                className="w-full max-w-md bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:shadow"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memproses Pendaftaran...</span>
                  </>
                ) : (
                  <>
                    <span>Daftar Sekarang</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center pt-6 border-t border-blue-100">
            <p className="text-gray-700 font-medium">
              Sudah punya akun?{' '}
              <Link 
                href="/" 
                className="text-blue-600 hover:text-blue-800 font-semibold transition-colors inline-flex items-center gap-2 group"
              >
                Masuk di sini
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm font-medium">
            © 2024 BBPMP - Nyurat-We. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}