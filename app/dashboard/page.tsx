// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, Home, BookOpen, Settings } from 'lucide-react';
import AuthGuard from '../components/AuthGuard';
import { isAuthenticated } from '@/app/middleware/auth';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Double check authentication
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }

    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/');
      return;
    }

    try {
      if (token.split('.').length === 3) {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        setUser(tokenData);
      } else {
        try {
          const userData = JSON.parse(token);
          setUser(userData);
        } catch {
          setUser({
            alamat_email: 'pengguna@bbpmp.com',
            name: 'Pengguna BBPMP'
          });
        }
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      setUser({
        alamat_email: 'pengguna@bbpmp.com',
        name: 'Pengguna BBPMP'
      });
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // Clear browser cache and history
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', '/');
    }
    
    // Redirect to login
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" suppressHydrationWarning>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <img 
                    src="/logo_bbpmp.png" 
                    alt="BBPMP Logo" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Nyurat-Keun</h1>
                  <p className="text-sm text-gray-600">Dashboard</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.alamat_email || 'Pengguna'}
                  </p>
                  <p className="text-xs text-gray-600">BBPMP Jawa Barat</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - tetap sama seperti sebelumnya */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 text-white mb-8 shadow-2xl">
            <h2 className="text-3xl font-bold mb-4">
              Selamat Datang di Nyurat-Keun! 🎉
            </h2>
            <p className="text-blue-100 text-lg max-w-2xl">
              Platform pembelajaran digital inovatif untuk mendukung pendidikan berkualitas di Indonesia.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* ... konten stats grid tetap sama ... */}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Aktivitas Terbaru</h3>
            <div className="space-y-4">
              {[
                { activity: 'Materi baru "Pembelajaran Digital" ditambahkan', time: '2 jam lalu' },
                { activity: '5 siswa baru bergabung', time: '5 jam lalu' },
                { activity: 'Quiz matematika selesai', time: '1 hari lalu' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <p className="text-gray-800 font-medium">{item.activity}</p>
                  <span className="text-sm text-gray-600">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}