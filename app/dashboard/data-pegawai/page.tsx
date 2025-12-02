// app/dashboard/data-pegawai/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '../../components/AuthGuard';
import DataPegawai from '../../components/dashboard/dataPegawai';
import { isAuthenticated } from '../../middleware/auth';
import { ChevronLeft } from 'lucide-react';

export default function DataPegawaiPage() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Cek autentikasi
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }
  }, [router]);

  const handleBackToDashboard = () => {
    if (isNavigating) return; // Mencegah multiple clicks
    
    setIsNavigating(true);
    
    // Gunakan replace untuk menghindari multiple history entries
    router.replace('/dashboard');
    
    // Reset state setelah navigasi
    setTimeout(() => {
      setIsNavigating(false);
    }, 1000);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" suppressHydrationWarning>
        <main className="py-8">
          {/* Header untuk Data Pegawai */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackToDashboard}
                  disabled={isNavigating}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-300 bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                  {isNavigating ? 'Mengarahkan...' : 'Kembali ke Dashboard'}
                </button>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-4 text-white">
                <p className="text-sm">Lihat Data</p>
                <p className="text-xl font-bold">Pegawai BBPMP</p>
              </div>
            </div>
          </div>

          {/* Komponen DataPegawai */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <DataPegawai onBack={handleBackToDashboard} />
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}