// app/dashboard/kegiatan-pegawai/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '../../components/AuthGuard';
import { 
  ChevronLeft, 
  Calendar, 
  Users, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import { isAuthenticated } from '../../middleware/auth';

interface Pegawai {
  nip: string;
  nama: string;
  jabatan: string;
  golongan: string;
}

interface Kegiatan {
  id: string;
  judul: string;
  deskripsi: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  lokasi: string;
  penyelenggara: string;
  status: 'draft' | 'published' | 'cancelled';
  peserta: string[]; // Array of NIP
  created_at: string;
}

interface JadwalPegawai {
  pegawai: Pegawai;
  kegiatan: Kegiatan[];
  totalKegiatan: number;
  konflikJadwal: number;
}

export default function KegiatanPegawaiPage() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [jadwalPegawai, setJadwalPegawai] = useState<JadwalPegawai[]>([]);
  
  // Filter state
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedGolongan, setSelectedGolongan] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Detail modal
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [pegawaiKegiatan, setPegawaiKegiatan] = useState<Kegiatan[]>([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch pegawai
      const pegawaiResponse = await fetch('http://localhost:3000/api/pegawai');
      if (pegawaiResponse.ok) {
        const pegawaiData = await pegawaiResponse.json();
        const pegawaiArray = Array.isArray(pegawaiData) ? pegawaiData : pegawaiData.data || [];
        setPegawaiList(pegawaiArray);
      }

      // Fetch kegiatan/surat
      const kegiatanResponse = await fetch('http://localhost:3000/api/surat');
      if (kegiatanResponse.ok) {
        const kegiatanData = await kegiatanResponse.json();
        const kegiatanArray = Array.isArray(kegiatanData) ? kegiatanData : kegiatanData.data || [];
        setKegiatanList(kegiatanArray);
        
        // Process jadwal
        processJadwal(pegawaiList, kegiatanArray);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processJadwal = (pegawai: Pegawai[], kegiatan: Kegiatan[]) => {
    const jadwal: JadwalPegawai[] = pegawai.map(pegawai => {
      const kegiatanPegawai = kegiatan.filter(k =>
        k.peserta.includes(pegawai.nip)
      );
      
      // Check for scheduling conflicts
      const konflik = checkKonflikJadwal(kegiatanPegawai);
      
      return {
        pegawai,
        kegiatan: kegiatanPegawai,
        totalKegiatan: kegiatanPegawai.length,
        konflikJadwal: konflik
      };
    });
    
    setJadwalPegawai(jadwal);
  };

  const checkKonflikJadwal = (kegiatanList: Kegiatan[]): number => {
    let konflik = 0;
    
    // Sort by start date
    const sorted = [...kegiatanList].sort((a, b) => 
      new Date(a.tanggal_mulai).getTime() - new Date(b.tanggal_mulai).getTime()
    );
    
    for (let i = 0; i < sorted.length - 1; i++) {
      const currentEnd = new Date(sorted[i].tanggal_selesai).getTime();
      const nextStart = new Date(sorted[i + 1].tanggal_mulai).getTime();
      
      if (currentEnd > nextStart) {
        konflik++;
      }
    }
    
    return konflik;
  };

  const filterJadwal = () => {
    let filtered = jadwalPegawai;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(j =>
        j.pegawai.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.pegawai.nip.includes(searchQuery) ||
        j.pegawai.jabatan.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by golongan
    if (selectedGolongan) {
      filtered = filtered.filter(j =>
        j.pegawai.golongan.startsWith(selectedGolongan)
      );
    }

    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter(j =>
        j.kegiatan.some(k => {
          const kegiatanDate = new Date(k.tanggal_mulai).toDateString();
          const filterDate = new Date(selectedDate).toDateString();
          return kegiatanDate === filterDate;
        })
      );
    }

    return filtered;
  };

  const handleViewDetails = (pegawai: Pegawai) => {
    setSelectedPegawai(pegawai);
    const kegiatan = kegiatanList.filter(k => k.peserta.includes(pegawai.nip));
    setPegawaiKegiatan(kegiatan);
    setDetailModalOpen(true);
  };

  const handleExport = () => {
    // Simple export to JSON
    const data = filterJadwal();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jadwal-pegawai-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBackToDashboard = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.replace('/dashboard');
    setTimeout(() => setIsNavigating(false), 1000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGolonganOptions = () => {
    const golonganSet = new Set(pegawaiList.map(p => p.golongan.charAt(0)));
    return Array.from(golonganSet).sort();
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" suppressHydrationWarning>
        <main className="py-8">
          {/* Header */}
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
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-4 text-white">
                <p className="text-sm">Monitoring</p>
                <p className="text-xl font-bold">Jadwal Kegiatan Pegawai</p>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filter Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Filter Jadwal</h3>
                  <p className="text-sm text-gray-600">Filter berdasarkan kriteria tertentu</p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  {/* Search */}
                  <div className="relative flex-1 min-w-[200px]">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari nama, NIP, atau jabatan..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>

                  {/* Golongan Filter */}
                  <select
                    value={selectedGolongan}
                    onChange={(e) => setSelectedGolongan(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Semua Golongan</option>
                    {getGolonganOptions().map(gol => (
                      <option key={gol} value={gol}>Golongan {gol}</option>
                    ))}
                  </select>

                  {/* Date Filter */}
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDate('');
                      setSelectedGolongan('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-xl"
                  >
                    Reset
                  </button>

                  <button
                    onClick={handleExport}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Pegawai</p>
                    <div className="text-2xl font-bold text-gray-900">{pegawaiList.length}</div>
                  </div>
                  <Users className="w-10 h-10 text-blue-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Kegiatan</p>
                    <div className="text-2xl font-bold text-gray-900">{kegiatanList.length}</div>
                  </div>
                  <Calendar className="w-10 h-10 text-green-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Rata-rata Kegiatan/Pegawai</p>
                    <div className="text-2xl font-bold text-gray-900">
                      {pegawaiList.length > 0 
                        ? (kegiatanList.length / pegawaiList.length).toFixed(1)
                        : '0'}
                    </div>
                  </div>
                  <Filter className="w-10 h-10 text-orange-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Konflik Jadwal</p>
                    <div className="text-2xl font-bold text-gray-900">
                      {jadwalPegawai.reduce((sum, j) => sum + j.konflikJadwal, 0)}
                    </div>
                  </div>
                  <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>
              </div>
            </div>

            {/* Jadwal Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Daftar Jadwal Pegawai</h3>
                    <p className="text-gray-600 mt-1">
                      Menampilkan {filterJadwal().length} dari {jadwalPegawai.length} pegawai
                    </p>
                  </div>
                  {loading && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Memuat data...
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pegawai
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jabatan & Golongan
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jumlah Kegiatan
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status Jadwal
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filterJadwal().map((jadwal) => (
                      <tr key={jadwal.pegawai.nip} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{jadwal.pegawai.nama}</div>
                              <div className="text-sm text-gray-500">NIP: {jadwal.pegawai.nip}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm font-medium text-gray-900">{jadwal.pegawai.jabatan}</div>
                          <div className="text-sm text-gray-500">{jadwal.pegawai.golongan}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="font-medium">{jadwal.totalKegiatan} kegiatan</span>
                          </div>
                          {jadwal.totalKegiatan > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              Terakhir: {formatDate(jadwal.kegiatan[0]?.tanggal_mulai || '')}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            {jadwal.konflikJadwal > 0 ? (
                              <div className="flex items-center gap-2 text-red-600">
                                <XCircle className="w-5 h-5" />
                                <div>
                                  <span className="font-medium">{jadwal.konflikJadwal} konflik</span>
                                  <div className="text-xs">Perlu penyesuaian jadwal</div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-5 h-5" />
                                <div>
                                  <span className="font-medium">Jadwal aman</span>
                                  <div className="text-xs">Tidak ada konflik</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleViewDetails(jadwal.pegawai)}
                            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Lihat Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filterJadwal().length === 0 && !loading && (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Tidak ada data jadwal yang sesuai dengan filter</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Detail Modal */}
        {detailModalOpen && selectedPegawai && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Detail Jadwal Kegiatan</h3>
                    <p className="text-gray-600">
                      {selectedPegawai.nama} • NIP: {selectedPegawai.nip}
                    </p>
                  </div>
                  <button
                    onClick={() => setDetailModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {pegawaiKegiatan.length > 0 ? (
                  <div className="space-y-4">
                    {pegawaiKegiatan.map((kegiatan) => (
                      <div
                        key={kegiatan.id}
                        className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{kegiatan.judul}</h4>
                            <p className="text-sm text-gray-600 mt-1">{kegiatan.deskripsi}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium">Waktu:</span>
                                  <span>{formatDate(kegiatan.tanggal_mulai)}</span>
                                </div>
                                <div className="ml-6 text-sm text-gray-600">
                                  s.d. {formatDate(kegiatan.tanggal_selesai)}
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium">Lokasi:</span>
                                  <span>{kegiatan.lokasi}</span>
                                </div>
                                <div className="ml-6 text-sm text-gray-600">
                                  Penyelenggara: {kegiatan.penyelenggara}
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                kegiatan.status === 'published'
                                  ? 'bg-green-100 text-green-800'
                                  : kegiatan.status === 'draft'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {kegiatan.status === 'published' ? 'Dipublikasi' : 
                                 kegiatan.status === 'draft' ? 'Draft' : 'Dibatalkan'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Pegawai ini belum memiliki jadwal kegiatan</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200">
                <div className="flex justify-end">
                  <button
                    onClick={() => setDetailModalOpen(false)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}