"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  User,
  Shield,
  Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<"email" | "whatsapp">("email");
  const [formData, setFormData] = useState({
    alamat_email: "",
    nomor_hp: "", // Tambah field untuk nomor HP
    password: "",
  });

  const router = useRouter();
  const API_BASE_URL = "http://localhost:3000";

  // Redirect jika sudah login
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validasi input
    if (loginType === "email" && !formData.alamat_email) {
      toast.error("❌ Harap masukkan alamat email");
      setIsLoading(false);
      return;
    }

    if (loginType === "whatsapp" && !formData.nomor_hp) {
      toast.error("❌ Harap masukkan nomor WhatsApp");
      setIsLoading(false);
      return;
    }

    if (!formData.password) {
      toast.error("❌ Harap masukkan password");
      setIsLoading(false);
      return;
    }

    // Siapkan data berdasarkan tipe login
    const requestData =
      loginType === "email"
        ? {
            alamat_email: formData.alamat_email,
            password: formData.password,
          }
        : {
            nomor_hp: formData.nomor_hp,
            password: formData.password,
          };

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("🎉 Login berhasil! Mengalihkan...");
        localStorage.setItem("token", data.token);
        // Redirect ke dashboard setelah 2 detik
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
      } else {
        toast.error(data.message || "❌ Login gagal");
      }
    } catch (error) {
      toast.error("🔌 Koneksi ke server gagal");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk membersihkan input saat mengganti tipe login
  const handleLoginTypeChange = (type: "email" | "whatsapp") => {
    setLoginType(type);
    setFormData((prev) => ({
      ...prev,
      alamat_email: type === "whatsapp" ? "" : prev.alamat_email,
      nomor_hp: type === "email" ? "" : prev.nomor_hp,
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Hanya angka

    // Format untuk display (0xxxxxxxxxx)
    if (value.startsWith("62")) {
      value = "0" + value.slice(2);
    }

    setFormData((prev) => ({
      ...prev,
      nomor_hp: value,
    }));
  };

  return (
    <div
      className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-50"
      suppressHydrationWarning
    >
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
          backgroundImage: "url(/bg_aula.png)",
        }}
      >
        {/* Overlay gradient untuk teks */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-blue-700/60"></div>

        {/* Welcome Text - Posisi dinaikan ke atas */}
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
                <p className="text-blue-100 text-sm font-medium">
                  Balai Besar Penjamin Mutu Pendidikan Provinsi Jawa Barat
                </p>
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Selamat Datang di{" "}
              <span className="text-blue-200 block">Nyurat-Keun</span>
            </h1>
            <p className="text-lg text-blue-100 leading-relaxed">
              Platform penyuratan digital yang inovatif untuk mendukung
              pendidikan berkualitas di Indonesia.
            </p>

            {/* Feature List */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-400/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-200" />
                </div>
                <span className="text-blue-100">Akses mudah kapan saja</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-400/20 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-200" />
                </div>
                <span className="text-blue-100">Keamanan data terjamin</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo - YANG DIPERBESAR */}
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
            {/* Header */}
            <div className="text-center mb-8">
              <div className="lg:hidden mb-4">
                <h2 className="text-xl font-bold text-gray-800">BBPMP</h2>
                <p className="text-gray-600 text-sm">
                  Balai Besar Pengembangan Media Pendidikan
                </p>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Masuk ke Akun
              </h1>
              <p className="text-gray-600 mt-3 font-medium">
                Silakan masuk untuk mengakses Nyurat-Keun
              </p>
            </div>

            {/* Login Type Selector */}
            <div className="flex mb-6 bg-blue-50 rounded-xl p-1">
              <button
                type="button"
                onClick={() => handleLoginTypeChange("email")}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
                  loginType === "email"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleLoginTypeChange("whatsapp")}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
                  loginType === "whatsapp"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  WhatsApp
                </div>
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              {loginType === "email" && (
                <div className="space-y-3">
                  <label
                    htmlFor="alamat_email"
                    className="text-sm font-semibold text-gray-800"
                  >
                    Alamat Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform duration-200 group-focus-within:scale-110">
                      <Mail className="h-5 w-5 text-blue-500" />
                    </div>
                    <input
                      type="email"
                      id="alamat_email"
                      name="alamat_email"
                      value={formData.alamat_email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-white/70 border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 shadow-sm text-gray-900 font-medium hover:border-blue-300 focus:bg-white"
                      placeholder="Masukkan@gmail.com"
                    />
                  </div>
                </div>
              )}

              {/* WhatsApp Input */}
              {loginType === "whatsapp" && (
                <div className="space-y-3">
                  <label
                    htmlFor="nomor_hp"
                    className="text-sm font-semibold text-gray-800"
                  >
                    Nomor WhatsApp
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
                      placeholder="Masukkan Nomor"
                      pattern="08[0-9]{8,11}"
                      maxLength={13}
                    />
                  </div>
                </div>
              )}

              {/* Password Input */}
              <div className="space-y-3">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-800"
                >
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform duration-200 group-focus-within:scale-110">
                    <Lock className="h-5 w-5 text-blue-500" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-11 pr-12 py-3.5 bg-white/70 border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 shadow-sm text-gray-900 font-medium hover:border-blue-300 focus:bg-white"
                    placeholder="Masukkan password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-blue-50 rounded-xl p-1 transition-all duration-200 hover:scale-110"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-blue-600 hover:text-blue-800 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-blue-600 hover:text-blue-800 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                {/* Checkbox dengan gaya yang sama seperti di register */}
                <label className="flex items-start space-x-3 cursor-pointer">
                  <div className="relative mt-1">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-blue-600 bg-white border-2 border-blue-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                    />
                  </div>
                  <span className="text-sm text-gray-700 leading-relaxed font-medium">
                    Ingat saya
                  </span>
                </label>
                <Link
                  href="/lupapassword"
                  className="text-sm text-blue-600 hover:text-blue-800 transition-all duration-200 font-semibold hover:underline"
                >
                  Lupa password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:shadow-md group"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-medium">Memproses...</span>
                  </>
                ) : (
                  <>
                    <span className="font-medium">Masuk ke Sistem</span>
                    <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-8 text-center pt-6 border-t border-blue-100/50">
              <p className="text-gray-700 font-medium">
                Belum punya akun?{" "}
                <Link
                  href="/register"
                  className="text-blue-600 hover:text-blue-800 font-semibold transition-all duration-200 inline-flex items-center gap-2 group hover:gap-3"
                >
                  Daftar di sini
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
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
    </div>
  );
}