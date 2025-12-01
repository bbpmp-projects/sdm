'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-toastify';
import { 
  LogOut, 
  User, 
  FileText, 
  Activity,
  ChevronDown,
  X,
  AlertTriangle
} from 'lucide-react';

interface NavbarProps {
  user?: {
    alamat_email?: string;
    name?: string;
  };
}

export default function DashboardNavbar({ user }: NavbarProps) {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    // Show success toast
    toast.success('Logout berhasil! Sampai jumpa kembali.', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    // Clear all auth data
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // Clear browser cache and history
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', '/');
    }
    
    // Redirect to login after a short delay to show the toast
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  const showLogoutConfirmation = () => {
    setIsProfileDropdownOpen(false);
    setIsLogoutModalOpen(true);
  };

  const navigationItems = [
    { 
      name: 'Buat Surat', 
      href: '/dashboard/buat-surat', 
      icon: FileText, 
      isActive: pathname === '/dashboard/buat-surat',
      description: 'Buat surat baru'
    },
    { 
      name: 'Aktivitas Pegawai', 
      href: '/dashboard/aktivitas', 
      icon: Activity, 
      isActive: pathname === '/dashboard/aktivitas',
      description: 'Lihat aktivitas pegawai'
    },
  ];

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20"> {/* Increased height */}
            {/* Logo dan Brand - Diperbesar */}
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center">
                <img 
                  src="/logo_bbpmp.png" 
                  alt="BBPMP Logo" 
                  className="w-16 h-16 object-contain" // Increased from w-10 h-10 to w-16 h-16
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nyurat-Keun</h1> {/* Increased from text-xl to text-2xl */}
                <p className="text-sm text-gray-600">Sistem Management Surat</p> {/* Updated description */}
              </div>
            </div>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center space-x-3">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.href)}
                    className={`flex items-center gap-3 px-6 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                      item.isActive
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 border border-gray-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-xs opacity-80">{item.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* User Profile dan Actions */}
            <div className="flex items-center gap-4">
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 border border-gray-200"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.alamat_email?.split('@')[0] || 'Pengguna'}
                    </p>
                    <p className="text-xs text-gray-600">BBPMP Jawa Barat</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    isProfileDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-blue-100 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.alamat_email || 'pengguna@bbpmp.com'}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">BBPMP Jawa Barat</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          router.push('/dashboard/profile');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <div>
                          <div className="font-medium">Profil Saya</div>
                          <div className="text-xs text-gray-500">Kelola profil pengguna</div>
                        </div>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={showLogoutConfirmation}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <div>
                          <div className="font-medium">Keluar</div>
                          <div className="text-xs text-red-500">Logout dari sistem</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden border-t border-gray-100 pt-4 pb-3">
            <div className="grid grid-cols-2 gap-3">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.href)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      item.isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 border border-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <div className="text-left">
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-xs opacity-80">{item.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Overlay untuk menutup dropdown saat klik di luar */}
        {isProfileDropdownOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsProfileDropdownOpen(false)}
          />
        )}
      </nav>

      {/* Logout Confirmation Modal - Background Transparan */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop yang transparan */}
          <div 
            className="absolute inset-0 bg-transparent"
            onClick={() => setIsLogoutModalOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative z-10 border border-blue-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Konfirmasi Keluar</h3>
                  <p className="text-sm text-gray-600">Anda yakin ingin keluar?</p>
                </div>
              </div>
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mb-6">
              <p className="text-gray-700">
                Anda akan keluar dari akun <span className="font-medium">{user?.alamat_email || 'pengguna@bbpmp.com'}</span>. 
                Untuk mengakses sistem kembali, Anda perlu login ulang.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all duration-200 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}