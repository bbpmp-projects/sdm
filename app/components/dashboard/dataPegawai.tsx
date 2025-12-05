// app/components/dashboard/dataPegawai.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  User, 
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Users,
  Briefcase,
  FileText
} from 'lucide-react';

interface Pegawai {
  nip: string;
  nama: string;
  jabatan: string;
  golongan: string;
  pangkat?: string;
  unit_kerja?: string;
  status?: 'aktif' | 'nonaktif';
}

// Tambahkan interface untuk props
interface DataPegawaiProps {
  onBack?: () => void;
}

// Fungsi helper untuk mendapatkan token dari localStorage
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export default function DataPegawai({ onBack }: DataPegawaiProps) {
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [filteredPegawai, setFilteredPegawai] = useState<Pegawai[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Fungsi untuk kembali ke dashboard
  const handleBackToDashboard = useCallback(() => {
    if (onBack) {
      onBack();
    }
  }, [onBack]);

  // Fetch semua data pegawai dari API
  const fetchPegawai = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = getToken();
      
      if (!token) {
        setError('Token autentikasi tidak ditemukan. Silakan login kembali.');
        setIsLoading(false);
        return;
      }
      
      const response = await fetch('http://10.12.192.203:3001/api/pegawai', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        setError('Sesi telah berakhir. Silakan login kembali.');
        // Optional: Clear token and redirect
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle berbagai format respons
      let pegawaiData: Pegawai[] = [];
      
      if (Array.isArray(data)) {
        // Format 1: Langsung array
        pegawaiData = data;
      } else if (data.data && Array.isArray(data.data)) {
        // Format 2: { data: [...] }
        pegawaiData = data.data;
      } else if (data.pegawai && Array.isArray(data.pegawai)) {
        // Format 3: { pegawai: [...] }
        pegawaiData = data.pegawai;
      } else if (data.results && Array.isArray(data.results)) {
        // Format 4: { results: [...] }
        pegawaiData = data.results;
      } else {
        // Format 5: Coba ekstrak array dari object
        const arrays = Object.values(data).filter(val => Array.isArray(val));
        if (arrays.length > 0) {
          pegawaiData = arrays[0] as Pegawai[];
        } else {
          throw new Error('Format data tidak dikenali');
        }
      }
      
      // Validasi dan format data
      const formattedData = pegawaiData.map((item: any) => ({
        nip: item.nip || item.NIP || item.id || '000000000000000000',
        nama: item.nama || item.Nama || item.name || 'Tidak Diketahui',
        jabatan: item.jabatan || item.Jabatan || item.position || '-',
        golongan: item.golongan || item.Golongan || item.grade || '-',
        pangkat: item.pangkat || item.Pangkat,
        unit_kerja: item.unit_kerja || item.unitKerja || item.department,
        status: item.status || item.Status || 'aktif'
      }));
      
      setPegawaiList(formattedData);
      setFilteredPegawai(formattedData);
      setTotalItems(formattedData.length);
      
    } catch (error) {
      console.error('Error fetching pegawai:', error);
      setError('Gagal mengambil data dari server. Pastikan API berjalan di http://10.12.192.203:3001/api/pegawai');
      
      // Kosongkan data jika API tidak tersedia
      setPegawaiList([]);
      setFilteredPegawai([]);
      setTotalItems(0);
      
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ... (sisa kode tetap sama, tidak perlu diubah)
  // Filter berdasarkan pencarian
  const applySearchFilter = useCallback(() => {
    let result = [...pegawaiList];

    // Filter berdasarkan pencarian
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter(pegawai =>
        pegawai.nama.toLowerCase().includes(keyword) ||
        pegawai.nip.toLowerCase().includes(keyword) ||
        pegawai.jabatan.toLowerCase().includes(keyword) ||
        pegawai.golongan.toLowerCase().includes(keyword) ||
        (pegawai.unit_kerja && pegawai.unit_kerja.toLowerCase().includes(keyword)) ||
        (pegawai.pangkat && pegawai.pangkat.toLowerCase().includes(keyword))
      );
    }

    setFilteredPegawai(result);
    setTotalItems(result.length);
    setCurrentPage(1); // Reset ke halaman pertama setelah filter
  }, [pegawaiList, searchKeyword]);

  // Search pegawai dengan filter pencarian
  const handleSearch = () => {
    applySearchFilter();
  };

  // Reset semua filter
  const handleReset = () => {
    setSearchKeyword('');
    setFilteredPegawai(pegawaiList);
    setTotalItems(pegawaiList.length);
    setCurrentPage(1);
  };

  // Format NIP
  const formatNIP = (nip: string) => {
    if (!nip || nip === '000000000000000000') return '-';
    // Hapus semua karakter non-digit dan kembalikan NIP tanpa format khusus
    const cleanedNip = nip.replace(/\D/g, '');
    return cleanedNip;
  };

  // Get color for golongan badge
  const getGolonganColor = (golongan: string) => {
    if (!golongan) return 'bg-gray-100 text-gray-700 border-gray-300';
    
    if (golongan.startsWith('IV')) {
      return 'bg-green-100 text-green-700 border border-green-300';
    } else if (golongan.startsWith('III')) {
      return 'bg-purple-100 text-purple-700 border border-purple-300';
    } else if (golongan.startsWith('II')) {
      return 'bg-orange-100 text-orange-700 border border-orange-300';
    } else if (golongan.startsWith('I') || golongan === 'I') {
      return 'bg-pink-100 text-pink-700 border border-pink-300';
    } else if (golongan === 'V') {
      return 'bg-blue-100 text-blue-700 border border-blue-300';
    }
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  // Pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredPegawai.slice(startIndex, endIndex);

  useEffect(() => {
    fetchPegawai();
  }, [fetchPegawai]);

  // Auto apply search when keyword changes
  useEffect(() => {
    if (searchKeyword) {
      const timer = setTimeout(() => {
        applySearchFilter();
      }, 500); // Debounce 500ms

      return () => clearTimeout(timer);
    } else {
      setFilteredPegawai(pegawaiList);
      setTotalItems(pegawaiList.length);
      setCurrentPage(1);
    }
  }, [searchKeyword, applySearchFilter, pegawaiList]);

  // Handle search when Enter is pressed
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && document.activeElement?.tagName === 'INPUT') {
        handleSearch();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [handleSearch]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Data Pegawai
          </h2>
          <p className="text-gray-600 mt-2">Daftar seluruh pegawai BBPMP Jawa Barat</p>
          {error && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
              {error.includes('Sesi telah berakhir') && (
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.location.href = '/';
                    }
                  }}
                  className="mt-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Login Kembali
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg">
            <span className="font-medium">Total: </span>
            {totalItems} pegawai
            {searchKeyword && (
              <span className="ml-2 text-blue-600">
                (Hasil pencarian)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Pencarian Data Pegawai
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan Nama, NIP, Jabatan, Golongan, atau Unit Kerja..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              {isLoading ? 'Memproses...' : 'Cari'}
            </button>
            
            <button
              onClick={handleReset}
              disabled={isLoading || !searchKeyword}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className="w-5 h-5" />
              Reset
            </button>
          </div>
        </div>
        
        {/* Search Status */}
        {searchKeyword && (
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm">
              <Search className="w-3 h-3" />
              Pencarian: "{searchKeyword}"
              <button
                onClick={() => setSearchKeyword('')}
                className="ml-1 hover:text-green-900"
              >
                ×
              </button>
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm">
              Hasil: {filteredPegawai.length} data ditemukan
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Memuat data pegawai...</p>
            <p className="text-sm text-gray-500 mt-2">Mengambil data dari http://10.12.192.203:3001/api/pegawai</p>
          </div>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Nama Pegawai
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    NIP
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Golongan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Jabatan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((pegawai, index) => (
                    <tr key={`${pegawai.nip}-${index}`} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {startIndex + index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {pegawai.nama}
                            </div>
                            {pegawai.unit_kerja && (
                              <div className="text-sm text-gray-500">
                                {pegawai.unit_kerja}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 font-mono">
                          {formatNIP(pegawai.nip)}
                        </div>
                        {pegawai.pangkat && (
                          <div className="text-xs text-gray-500 mt-1">
                            {pegawai.pangkat}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getGolonganColor(pegawai.golongan)}`}>
                            <span className="text-xs font-bold">
                              {pegawai.golongan?.charAt(0) || '-'}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {pegawai.golongan || '-'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-900">{pegawai.jabatan}</div>
                            {pegawai.status && (
                              <div className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${pegawai.status === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {pegawai.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Tidak ada data pegawai ditemukan</p>
                        <p className="text-sm mt-2">
                          {searchKeyword
                            ? `Tidak ditemukan hasil untuk "${searchKeyword}"`
                            : 'Data pegawai kosong'}
                        </p>
                        {!searchKeyword && pegawaiList.length === 0 && !error && (
                          <button
                            onClick={fetchPegawai}
                            className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Coba muat ulang
                          </button>
                        )}
                        {searchKeyword && (
                          <button
                            onClick={handleReset}
                            className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Reset pencarian
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 px-2">
              <div className="text-sm text-gray-700">
                Menampilkan {startIndex + 1}-{Math.min(endIndex, totalItems)} dari {totalItems} pegawai
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-blue-50 border border-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Export Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Ekspor Data</h4>
                <p className="text-sm text-gray-600">
                  {searchKeyword
                    ? `Ekspor hasil pencarian "${searchKeyword}"`
                    : 'Ekspor semua data pegawai'}
                </p>
              </div>
              <button
                onClick={() => {
                  const csvContent = [
                    ['No', 'Nama', 'NIP', 'Golongan', 'Jabatan', 'Unit Kerja', 'Pangkat', 'Status'],
                    ...filteredPegawai.map((p, i) => [
                      i + 1,
                      p.nama,
                      p.nip,
                      p.golongan,
                      p.jabatan,
                      p.unit_kerja || '',
                      p.pangkat || '',
                      p.status || ''
                    ])
                  ].map(row => row.join(',')).join('\n');

                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = searchKeyword
                    ? `data-pegawai-pencarian-${searchKeyword}-${new Date().toISOString().split('T')[0]}.csv`
                    : `data-pegawai-bbpmp-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
                disabled={filteredPegawai.length === 0}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                Ekspor CSV ({filteredPegawai.length} data)
              </button>
            </div>
          </div>
        </>
      )}

      {/* Info Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between text-sm text-gray-600 gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Status Aktif</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Status Nonaktif</span>
            </div>
          </div>
          <div className="text-right">
            <div>Data diperbarui: {new Date().toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}</div>
          </div>
        </div>
      </div>
    </div>
  );
}