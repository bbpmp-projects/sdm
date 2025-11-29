// app/components/LoginForm/LoginForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import LoginTypeSelector from "./LoginTypeSelector";
import EmailInput from "./EmailInput";
import WhatsAppInput from "./WhatsAppInput";
import PasswordInput from "./PasswordInput";
import LoadingSpinner from "../UILoginForm/LoadingSpinner";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<"email" | "whatsapp">("email");
  const [formData, setFormData] = useState({
    alamat_email: "",
    nomor_hp: "",
    password: "",
  });

  const API_BASE_URL = "http://localhost:3000";

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneChange = (value: string) => {
    let formattedValue = value.replace(/\D/g, ""); // Hanya angka

    // Format untuk display (0xxxxxxxxxx)
    if (formattedValue.startsWith("62")) {
      formattedValue = "0" + formattedValue.slice(2);
    }

    setFormData((prev) => ({
      ...prev,
      nomor_hp: formattedValue,
    }));
  };

  const handleLoginTypeChange = (type: "email" | "whatsapp") => {
    setLoginType(type);
    setFormData((prev) => ({
      ...prev,
      alamat_email: type === "whatsapp" ? "" : prev.alamat_email,
      nomor_hp: type === "email" ? "" : prev.nomor_hp,
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

  return (
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
        <LoginTypeSelector
          loginType={loginType}
          onLoginTypeChange={handleLoginTypeChange}
        />

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          {loginType === "email" && (
            <EmailInput
              value={formData.alamat_email}
              onChange={(value) => handleInputChange("alamat_email", value)}
            />
          )}

          {/* WhatsApp Input */}
          {loginType === "whatsapp" && (
            <WhatsAppInput
              value={formData.nomor_hp}
              onChange={handlePhoneChange}
            />
          )}

          {/* Password Input */}
          <PasswordInput
            value={formData.password}
            onChange={(value) => handleInputChange("password", value)}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
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
              <LoadingSpinner text="Memproses..." />
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
  );
}