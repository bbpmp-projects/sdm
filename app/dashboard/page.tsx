// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '../components/AuthGuard';
import { isAuthenticated } from '../middleware/auth';
import DashboardNavbar from '../components/dashboard/navbar';
import { 
  Users, 
  FileText, 
  Activity, 
  BookOpen, 
  BarChart, 
  Clock, 
  Calendar,
  Target,
  Mail,
  User as UserIcon,
  Home,
  Briefcase,
  ClipboardList
} from 'lucide-react';

// Interface untuk data pegawai
interface Pegawai {
  nip: string;
  nama: string;
  jabatan: string;
  golongan: string;
  pangkat?: string;
  unit_kerja?: string;
  status?: 'aktif' | 'nonaktif';
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pegawaiData, setPegawaiData] = useState<Pegawai[]>([]);
  const [isLoadingPegawai, setIsLoadingPegawai] = useState(false);
  const [totalPegawai, setTotalPegawai] = useState<number>(0);
  const router = useRouter();

  // Fungsi untuk fetch data pegawai dari API
  const fetchPegawaiData = async () => {
    try {
      setIsLoadingPegawai(true);
      const response = await fetch('http://localhost:3000/api/pegawai');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle berbagai format respons
      let pegawaiList: Pegawai[] = [];
      
      if (Array.isArray(data)) {
        // Format 1: Langsung array
        pegawaiList = data;
      } else if (data.data && Array.isArray(data.data)) {
        // Format 2: { data: [...] }
        pegawaiList = data.data;
      } else if (data.pegawai && Array.isArray(data.pegawai)) {
        // Format 3: { pegawai: [...] }
        pegawaiList = data.pegawai;
      } else if (data.results && Array.isArray(data.results)) {
        // Format 4: { results: [...] }
        pegawaiList = data.results;
      } else {
        // Format 5: Coba ekstrak array dari object
        const arrays = Object.values(data).filter(val => Array.isArray(val));
        if (arrays.length > 0) {
          pegawaiList = arrays[0] as Pegawai[];
        } else {
          throw new Error('Format data tidak dikenali');
        }
      }
      
      // Validasi dan format data
      const formattedData = pegawaiList.map((item: any) => ({
        nip: item.nip || item.NIP || item.id || '000000000000000000',
        nama: item.nama || item.Nama || item.name || 'Tidak Diketahui',
        jabatan: item.jabatan || item.Jabatan || item.position || '-',
        golongan: item.golongan || item.Golongan || item.grade || '-',
        pangkat: item.pangkat || item.Pangkat,
        unit_kerja: item.unit_kerja || item.unitKerja || item.department,
        status: item.status || item.Status || 'aktif'
      }));
      
      setPegawaiData(formattedData);
      setTotalPegawai(formattedData.length);
      
    } catch (error) {
      console.error('Error fetching pegawai data:', error);
      // Jika error, set default ke 0
      setPegawaiData([]);
      setTotalPegawai(0);
    } finally {
      setIsLoadingPegawai(false);
    }
  };

  // Fungsi untuk menghitung pegawai aktif
  const countAktifPegawai = () => {
    return pegawaiData.filter(pegawai => pegawai.status === 'aktif').length;
  };

  // Auth dan inisialisasi user
  useEffect(() => {
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

    // Fetch data pegawai saat komponen dimuat
    fetchPegawaiData();
  }, [router]);

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

  const totalAktif = countAktifPegawai();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" suppressHydrationWarning>
        {/* Gunakan Navbar HANYA di dashboard utama */}
        <DashboardNavbar user={user} />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 text-white mb-8 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  Selamat Datang di Nyurat-Keun! 🎉
                </h2>
                <p className="text-blue-100 text-lg max-w-2xl">
                  Sistem Manajemen Surat digital untuk mendukung administrasi berkualitas di BBPMP Jawa Barat.
                </p>
              </div>
              <div className="mt-4 md:mt-0 bg-white/20 rounded-xl p-4">
                <p className="text-sm">Halo,</p>
                <p className="text-xl font-bold">{user?.name || 'Pengguna BBPMP'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Mail className="w-4 h-4" />
                  <p className="text-sm">{user?.alamat_email || 'pengguna@bbpmp.com'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Data Pegawai Card */}
            <div 
              onClick={() => router.push('/dashboard/data-pegawai')}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Data Pegawai</p>
                  <div className="text-2xl font-bold text-gray-900">
                    {isLoadingPegawai ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : (
                      totalPegawai
                    )}
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-green-600 font-medium">{totalAktif} aktif</span>
                <span className="ml-2">• {totalPegawai - totalAktif} nonaktif</span>
              </div>
              <div className="mt-4">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Lihat Selengkapnya →
                </button>
              </div>
            </div>

            {/* Kegiatan Pegawai Card */}
            <div 
              onClick={() => router.push('/dashboard/kegiatan-pegawai')}
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Kegiatan Pegawai</p>
                  <div className="text-2xl font-bold text-gray-900">42</div>
                </div>
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-green-600 mr-2" />
                <span>15 kegiatan bulan ini</span>
              </div>
              <div className="mt-4">
                <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                  Kelola Kegiatan →
                </button>
              </div>
            </div>

            {/* Surat Kegiatan Card */}
            <div 
              onClick={() => router.push('/dashboard/surat-kegiatan')}
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Surat Kegiatan</p>
                  <div className="text-2xl font-bold text-gray-900">28</div>
                </div>
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FileText className="w-4 h-4 text-purple-600 mr-2" />
                <span>5 surat menunggu</span>
              </div>
              <div className="mt-4">
                <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                  Lihat Surat →
                </button>
              </div>
            </div>
          </div>

          {/* Fitur Utama Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Fitur Utama</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tombol Kegiatan Pegawai */}
              <button
                onClick={() => router.push('/dashboard/kegiatan-pegawai')}
                className="flex items-center gap-4 p-5 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl border border-green-200 transition-all duration-200 group"
              >
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ClipboardList className="w-7 h-7 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-gray-900 text-lg">Kelola Kegiatan Pegawai</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Pantau dan kelola semua kegiatan, tugas, dan pencapaian pegawai di satu tempat
                  </div>
                </div>
                <div className="text-green-600 group-hover:translate-x-2 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Tombol Surat Kegiatan */}
              <button
                onClick={() => router.push('/dashboard/surat-kegiatan')}
                className="flex items-center gap-4 p-5 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl border border-purple-200 transition-all duration-200 group"
              >
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-gray-900 text-lg">Surat Kegiatan</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Buat, kelola, dan pantau semua surat yang berkaitan dengan kegiatan organisasi
                  </div>
                </div>
                <div className="text-purple-600 group-hover:translate-x-2 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}