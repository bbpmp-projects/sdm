// app/dashboard/surat-kegiatan/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '../../components/AuthGuard';
import { ChevronLeft, Calendar, Users, FileText, CheckCircle, XCircle } from 'lucide-react';
import { isAuthenticated } from '../../middleware/auth';

interface Pegawai {
  nip: string;
  nama: string;
  jabatan: string;
  golongan: string;
  pangkat?: string;
  unit_kerja?: string;
}

interface SuratKegiatanData {
  judul: string;
  deskripsi: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  lokasi: string;
  penyelenggara: string;
  peserta: string[]; // Array of NIP
}

export default function SuratKegiatanPage() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPegawai, setFilteredPegawai] = useState<Pegawai[]>([]);
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai[]>([]);
  const [availabilityStatus, setAvailabilityStatus] = useState<Record<string, boolean>>({});
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Form state
  const [formData, setFormData] = useState<SuratKegiatanData>({
    judul: '',
    deskripsi: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    lokasi: '',
    penyelenggara: '',
    peserta: []
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }
    fetchPegawai();
  }, [router]);

  const fetchPegawai = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/pegawai');
      if (response.ok) {
        const data = await response.json();
        const rawList = Array.isArray(data) ? data : data.data || [];
        
        // Filter untuk menghapus duplikat berdasarkan NIP
        const uniquePegawaiList = rawList.filter(
          (pegawai: Pegawai, index: number, self: Pegawai[]) =>
            index === self.findIndex((p) => p.nip === pegawai.nip)
        );
        
        setPegawaiList(uniquePegawaiList);
        setFilteredPegawai(uniquePegawaiList);
      }
    } catch (error) {
      console.error('Error fetching pegawai:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredPegawai(pegawaiList);
    } else {
      const filtered = pegawaiList.filter(pegawai =>
        pegawai.nama.toLowerCase().includes(query.toLowerCase()) ||
        pegawai.nip.includes(query) ||
        pegawai.jabatan.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPegawai(filtered);
    }
  };

  const togglePegawaiSelection = (pegawai: Pegawai) => {
    const isSelected = selectedPegawai.some(p => p.nip === pegawai.nip);
    if (isSelected) {
      setSelectedPegawai(selectedPegawai.filter(p => p.nip !== pegawai.nip));
    } else {
      setSelectedPegawai([...selectedPegawai, pegawai]);
    }
  };

  // Fungsi untuk konversi date ke ISO tanpa waktu
  const formatDateForAPI = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };

  // Fungsi untuk menambahkan waktu default saat mengirim ke API
  const addDefaultTimeForAPI = (dateString: string) => {
    if (!dateString) return '';
    return `${dateString}T08:00:00`; // Tambahkan waktu default 08:00:00
  };

  const checkAvailability = async () => {
    if (!formData.tanggal_mulai || !formData.tanggal_selesai || selectedPegawai.length === 0) {
      alert('Harap isi tanggal dan pilih pegawai terlebih dahulu');
      return;
    }

    setCheckingAvailability(true);
    const status: Record<string, boolean> = {};

    try {
      for (const pegawai of selectedPegawai) {
        // Format tanggal untuk API (dengan waktu default)
        const startDateWithTime = addDefaultTimeForAPI(formData.tanggal_mulai);
        const endDateWithTime = addDefaultTimeForAPI(formData.tanggal_selesai);
        
        const response = await fetch(
          `http://localhost:3000/api/surat/check-availability?nip=${pegawai.nip}&start=${startDateWithTime}&end=${endDateWithTime}`
        );
        
        if (response.ok) {
          const data = await response.json();
          status[pegawai.nip] = data.available; // Asumsi API mengembalikan { available: boolean }
        } else {
          status[pegawai.nip] = true; // Default jika error
        }
      }
      setAvailabilityStatus(status);
    } catch (error) {
      console.error('Error checking availability:', error);
      alert('Gagal memeriksa ketersediaan');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedPegawai.length === 0) {
      alert('Pilih minimal 1 pegawai sebagai peserta');
      return;
    }

    setIsSubmitting(true);

    try {
      // Format tanggal untuk API (dengan waktu default)
      const startDateWithTime = addDefaultTimeForAPI(formData.tanggal_mulai);
      const endDateWithTime = addDefaultTimeForAPI(formData.tanggal_selesai);
      
      const suratData = {
        ...formData,
        tanggal_mulai: startDateWithTime,
        tanggal_selesai: endDateWithTime,
        peserta: selectedPegawai.map(p => p.nip),
        status: 'draft',
        created_at: new Date().toISOString()
      };

      const response = await fetch('http://localhost:3000/api/surat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(suratData)
      });

      if (response.ok) {
        alert('Surat kegiatan berhasil dibuat!');
        router.push('/dashboard');
      } else {
        const error = await response.json();
        alert(`Gagal membuat surat: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating surat:', error);
      alert('Terjadi kesalahan saat membuat surat');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToDashboard = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.replace('/dashboard');
    setTimeout(() => setIsNavigating(false), 1000);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Fungsi untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
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
              <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl p-4 text-white">
                <p className="text-sm">Buat Surat</p>
                <p className="text-xl font-bold">Kegiatan</p>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Form Surat Kegiatan</h2>
                <p className="text-gray-600 mt-2">Isi detail kegiatan dan pilih peserta</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Informasi Kegiatan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Judul Kegiatan *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.judul}
                      onChange={(e) => setFormData({...formData, judul: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Contoh: Rapat Koordinasi Bulanan"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Penyelenggara *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.penyelenggara}
                      onChange={(e) => setFormData({...formData, penyelenggara: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Contoh: BBPMP Jawa Barat"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Mulai *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        required
                        value={formData.tanggal_mulai}
                        onChange={(e) => setFormData({...formData, tanggal_mulai: e.target.value})}
                        min={getTodayDate()}
                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Hanya tanggal, tanpa waktu</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Selesai *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        required
                        value={formData.tanggal_selesai}
                        onChange={(e) => setFormData({...formData, tanggal_selesai: e.target.value})}
                        min={formData.tanggal_mulai || getTodayDate()}
                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Hanya tanggal, tanpa waktu</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lokasi *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lokasi}
                      onChange={(e) => setFormData({...formData, lokasi: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Contoh: Ruang Rapat Lantai 3"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi Kegiatan
                    </label>
                    <textarea
                      value={formData.deskripsi}
                      onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Jelaskan detail kegiatan..."
                    />
                  </div>
                </div>

                {/* Pencarian dan Pemilihan Pegawai */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Pilih Peserta Kegiatan</h3>
                      <p className="text-sm text-gray-600">Pilih pegawai yang akan mengikuti kegiatan</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        Terpilih: {selectedPegawai.length} pegawai
                      </span>
                      <button
                        type="button"
                        onClick={checkAvailability}
                        disabled={checkingAvailability || !formData.tanggal_mulai || selectedPegawai.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {checkingAvailability ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Memeriksa...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Cek Ketersediaan
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative mb-4">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Cari pegawai berdasarkan NIP, nama, atau jabatan..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>

                  {/* Daftar Pegawai */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
                    {filteredPegawai.map((pegawai) => {
                      const isSelected = selectedPegawai.some(p => p.nip === pegawai.nip);
                      const isAvailable = availabilityStatus[pegawai.nip];

                      return (
                        <div
                          key={pegawai.nip}
                          onClick={() => togglePegawaiSelection(pegawai)}
                          className={`p-4 border rounded-xl cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Users className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{pegawai.nama}</h4>
                                  <p className="text-xs text-gray-500">NIP: {pegawai.nip}</p>
                                </div>
                              </div>
                              
                              <div className="mt-3 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded">
                                    {pegawai.jabatan}
                                  </span>
                                  <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-800 rounded">
                                    {pegawai.golongan}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600">{pegawai.unit_kerja || '-'}</p>
                              </div>

                              {/* Availability Status */}
                              {isSelected && isAvailable !== undefined && (
                                <div className="mt-3 flex items-center gap-2">
                                  {isAvailable ? (
                                    <>
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                      <span className="text-xs text-green-600 font-medium">
                                        Tersedia pada tanggal yang dipilih
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-4 h-4 text-red-600" />
                                      <span className="text-xs text-red-600 font-medium">
                                        Bertabrakan dengan jadwal lain
                                      </span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="ml-2">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                isSelected 
                                  ? 'border-blue-500 bg-blue-500' 
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && (
                                  <CheckCircle className="w-4 h-4 text-white" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tanggal Kegiatan Summary */}
                  {formData.tanggal_mulai && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                      <h4 className="font-medium text-gray-900 mb-2">Detail Waktu Kegiatan:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-gray-600">Mulai:</p>
                          <p className="font-medium">{formatDate(formData.tanggal_mulai)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Selesai:</p>
                          <p className="font-medium">{formatDate(formData.tanggal_selesai)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleBackToDashboard}
                    className="px-6 py-2 text-gray-600 hover:text-gray-900"
                  >
                    Batal
                  </button>
                  
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        // Reset form
                        setFormData({
                          judul: '',
                          deskripsi: '',
                          tanggal_mulai: '',
                          tanggal_selesai: '',
                          lokasi: '',
                          penyelenggara: '',
                          peserta: []
                        });
                        setSelectedPegawai([]);
                        setAvailabilityStatus({});
                      }}
                      className="px-6 py-2 text-gray-600 hover:text-gray-900"
                    >
                      Reset Form
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting || selectedPegawai.length === 0}
                      className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Membuat Surat...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          Buat Surat Kegiatan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}