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
  Award, 
  Mail, 
  CheckCircle,
  User as UserIcon,
  Home
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

  // Fungsi untuk menghitung distribusi golongan
  const getGolonganDistribution = () => {
    const golonganCounts: { [key: string]: number } = {
      'IV': 0,
      'III': 0,
      'II': 0,
      'I': 0
    };
    
    pegawaiData.forEach(pegawai => {
      const gol = pegawai.golongan?.charAt(0);
      if (gol && ['I', 'II', 'III', 'IV'].includes(gol)) {
        if (gol === 'I') {
          golonganCounts['I']++;
        } else if (gol === 'II') {
          golonganCounts['II']++;
        } else if (gol === 'III') {
          golonganCounts['III']++;
        } else if (gol === 'IV') {
          golonganCounts['IV']++;
        }
      }
    });
    
    return golonganCounts;
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

  // Hitung distribusi golongan
  const golonganDist = getGolonganDistribution();
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Data Pegawai Card - Klik untuk melihat data pegawai */}
            <div 
              onClick={() => router.push('/dashboard/data-pegawai')}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group relative z-10"
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

            {/* Surat Masuk Card */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Surat Masuk</p>
                  <div className="text-2xl font-bold text-gray-900">124</div>
                </div>
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                <span>12 belum diproses</span>
              </div>
            </div>

            {/* Surat Keluar Card */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Surat Keluar</p>
                  <div className="text-2xl font-bold text-gray-900">89</div>
                </div>
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 text-purple-600 mr-2" />
                <span>3 dalam proses</span>
              </div>
            </div>

            {/* Aktivitas Pegawai Card */}
            <div 
              onClick={() => router.push('/dashboard/aktivitas')}
              className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Aktivitas</p>
                  <div className="text-2xl font-bold text-gray-900">267</div>
                </div>
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <BarChart className="w-4 h-4 text-orange-600 mr-2" />
                <span>Aktif hari ini</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Akses Cepat</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/dashboard/buat-surat')}
                className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl border border-blue-200 transition-all duration-200 group"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-900">Buat Surat Baru</div>
                  <div className="text-sm text-gray-600">Buat surat resmi baru</div>
                </div>
              </button>

              <button
                onClick={() => router.push('/dashboard/data-pegawai')}
                className="flex items-center gap-4 p-5 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl border border-green-200 transition-all duration-200 group"
              >
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-900">Kelola Pegawai</div>
                  <div className="text-sm text-gray-600">Lihat & kelola data pegawai</div>
                </div>
              </button>

              <button
                onClick={() => router.push('/dashboard/aktivitas')}
                className="flex items-center gap-4 p-5 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl border border-purple-200 transition-all duration-200 group"
              >
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-900">Monitoring Aktivitas</div>
                  <div className="text-sm text-gray-600">Pantau aktivitas pegawai</div>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Aktivitas Terbaru</h3>
              <button 
                onClick={() => router.push('/dashboard/aktivitas')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Lihat Semua →
              </button>
            </div>
            <div className="space-y-4">
              {[
                { 
                  activity: 'Surat undangan rapat telah dibuat oleh Andi Pratama', 
                  time: '2 jam lalu',
                  type: 'surat',
                  user: 'Andi Pratama'
                },
                { 
                  activity: `Data pegawai: ${totalPegawai} pegawai terdata dalam sistem`, 
                  time: 'Baru saja',
                  type: 'pegawai',
                  user: 'System'
                },
                { 
                  activity: 'Laporan bulanan telah diselesaikan', 
                  time: '1 hari lalu',
                  type: 'laporan',
                  user: 'Siti Rahayu'
                },
                { 
                  activity: '3 surat masuk baru perlu diproses', 
                  time: '1 hari lalu',
                  type: 'surat',
                  user: 'System'
                },
                { 
                  activity: `Pegawai aktif: ${totalAktif} dari ${totalPegawai} total pegawai`, 
                  time: 'Baru saja',
                  type: 'pegawai',
                  user: 'System'
                },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.type === 'surat' ? 'bg-blue-100 text-blue-600' :
                      item.type === 'pegawai' ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {item.type === 'surat' && <FileText className="w-5 h-5" />}
                      {item.type === 'pegawai' && <Users className="w-5 h-5" />}
                      {item.type === 'laporan' && <Activity className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="text-gray-800 font-medium">{item.activity}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          <UserIcon className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-600">{item.user}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-600">{item.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-600">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Golongan Pegawai Overview */}
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Distribusi Golongan Pegawai</h3>
              <button
                onClick={() => router.push('/dashboard/data-pegawai')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Lihat Detail →
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { golongan: 'Golongan IV', count: golonganDist['IV'], color: 'from-blue-600 to-blue-800' },
                { golongan: 'Golongan III', count: golonganDist['III'], color: 'from-green-600 to-green-800' },
                { golongan: 'Golongan II', count: golonganDist['II'], color: 'from-purple-600 to-purple-800' },
                { golongan: 'Golongan I', count: golonganDist['I'], color: 'from-orange-600 to-orange-800' },
              ].map((item, index) => (
                <div 
                  key={index} 
                  onClick={() => router.push('/dashboard/data-pegawai')}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center`}>
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {isLoadingPegawai ? '-' : item.count}
                      </div>
                      <div className="text-xs text-gray-600">orang</div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="font-bold text-gray-900">{item.golongan}</div>
                    <div className="text-xs text-gray-500 mt-1">Klik untuk lihat detail</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${item.color}`}
                      style={{ width: totalPegawai > 0 ? `${(item.count / totalPegawai) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                <Home className="w-4 h-4" />
                Dashboard Utama
              </button>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/dashboard/data-pegawai')}
                  className="px-6 py-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Data Pegawai
                </button>
                <button
                  onClick={() => router.push('/dashboard/buat-surat')}
                  className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-medium transition-all"
                >
                  Buat Surat Baru
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}