// app/components/UI/WelcomeSection.tsx
import { User, Shield } from "lucide-react";

export default function WelcomeSection() {
  return (
    <div
      className="hidden lg:flex lg:w-1/2 bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: "url(/bg_aula.png)",
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
  );
}