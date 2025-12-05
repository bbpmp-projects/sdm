// app/dashboard/surat-kegiatan/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "../../components/AuthGuard";
import {
  ChevronLeft,
  Calendar,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Printer,
} from "lucide-react";
import { isAuthenticated } from "../../middleware/auth";

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
  peserta: string[];
  // Tambahan field untuk template surat
  nomor_surat?: string;
  nomor_surat_pendukung?: string;
  tanggal_surat_pendukung?: string;
  angkatan?: string;
  keterangan?: string;
  tanggal_pelaporan?: string;
  link_pelaporan?: string;
}

export default function SuratKegiatanPage() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPegawai, setFilteredPegawai] = useState<Pegawai[]>([]);
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai[]>([]);
  const [availabilityStatus, setAvailabilityStatus] = useState<
    Record<string, boolean>
  >({});
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // State untuk input template
  const [templateData, setTemplateData] = useState({
    angkatan: "",
    keterangan: "",
    tanggal_pelaporan: "",
    link_pelaporan: "",
    nomor_surat_pendukung: "",
    tanggal_surat_pendukung: "",
  });

  // Form state
  const [formData, setFormData] = useState<SuratKegiatanData>({
    judul: "",
    deskripsi: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    lokasi: "",
    penyelenggara: "",
    peserta: [],
    angkatan: "",
    keterangan: "",
    tanggal_pelaporan: "",
    link_pelaporan: "",
    nomor_surat_pendukung: "",
    tanggal_surat_pendukung: "",
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/");
      return;
    }
    fetchPegawai();
    // Generate nomor surat otomatis
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const nomorSurat = `${randomNum}/BBPMP-JB/${month}.${day}/${year}`;
    setFormData((prev) => ({ ...prev, nomor_surat: nomorSurat }));
  }, [router]);

  const fetchPegawai = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/pegawai");
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
      console.error("Error fetching pegawai:", error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredPegawai(pegawaiList);
    } else {
      const filtered = pegawaiList.filter(
        (pegawai) =>
          pegawai.nama.toLowerCase().includes(query.toLowerCase()) ||
          pegawai.nip.includes(query) ||
          pegawai.jabatan.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPegawai(filtered);
    }
  };

  const togglePegawaiSelection = (pegawai: Pegawai) => {
    const isSelected = selectedPegawai.some((p) => p.nip === pegawai.nip);
    if (isSelected) {
      setSelectedPegawai(selectedPegawai.filter((p) => p.nip !== pegawai.nip));
    } else {
      setSelectedPegawai([...selectedPegawai, pegawai]);
    }
  };

  // Fungsi untuk konversi date ke ISO tanpa waktu
  const formatDateForAPI = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Fungsi untuk menambahkan waktu default saat mengirim ke API
  const addDefaultTimeForAPI = (dateString: string) => {
    if (!dateString) return "";
    return `${dateString}T08:00:00`;
  };

  const checkAvailability = async () => {
    if (
      !formData.tanggal_mulai ||
      !formData.tanggal_selesai ||
      selectedPegawai.length === 0
    ) {
      alert("Harap isi tanggal dan pilih pegawai terlebih dahulu");
      return;
    }

    setCheckingAvailability(true);
    const status: Record<string, boolean> = {};

    try {
      for (const pegawai of selectedPegawai) {
        const startDateWithTime = addDefaultTimeForAPI(formData.tanggal_mulai);
        const endDateWithTime = addDefaultTimeForAPI(formData.tanggal_selesai);

        const response = await fetch(
          `http://localhost:3000/api/surat/check-availability?nip=${pegawai.nip}&start=${startDateWithTime}&end=${endDateWithTime}`
        );

        if (response.ok) {
          const data = await response.json();
          status[pegawai.nip] = data.available;
        } else {
          status[pegawai.nip] = true;
        }
      }
      setAvailabilityStatus(status);
    } catch (error) {
      console.error("Error checking availability:", error);
      alert("Gagal memeriksa ketersediaan");
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPegawai.length === 0) {
      alert("Pilih minimal 1 pegawai sebagai peserta");
      return;
    }

    setIsSubmitting(true);

    try {
      const startDateWithTime = addDefaultTimeForAPI(formData.tanggal_mulai);
      const endDateWithTime = addDefaultTimeForAPI(formData.tanggal_selesai);

      const suratData = {
        ...formData,
        tanggal_mulai: startDateWithTime,
        tanggal_selesai: endDateWithTime,
        peserta: selectedPegawai.map((p) => p.nip),
        status: "draft",
        created_at: new Date().toISOString(),
      };

      const response = await fetch("http://localhost:3000/api/surat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(suratData),
      });

      if (response.ok) {
        alert("Surat kegiatan berhasil dibuat!");
        router.push("/dashboard");
      } else {
        const error = await response.json();
        alert(`Gagal membuat surat: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error creating surat:", error);
      alert("Terjadi kesalahan saat membuat surat");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToDashboard = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.replace("/dashboard");
    setTimeout(() => setIsNavigating(false), 1000);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateShort = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Fungsi untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Handler untuk input template
  const handleTemplateChange = (field: string, value: string) => {
    setTemplateData((prev) => ({ ...prev, [field]: value }));
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AuthGuard>
      <div
        className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50"
        suppressHydrationWarning
      >
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
                  {isNavigating ? "Mengarahkan..." : "Kembali ke Dashboard"}
                </button>
              </div>
              <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl p-4 text-white">
                <p className="text-sm">Buat Surat</p>
                <p className="text-xl font-bold">Kegiatan</p>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Input - Kiri */}
              <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden h-fit">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Form Surat Kegiatan
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Isi detail kegiatan dan pilih peserta
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Informasi Kegiatan */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Judul Kegiatan *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.judul}
                        onChange={(e) =>
                          setFormData({ ...formData, judul: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Contoh: Pelatihan Teknis Pelayanan Publik"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Penyelenggara *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.penyelenggara}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              penyelenggara: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Contoh: Kemendikdasmen"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Angkatan
                        </label>
                        <input
                          type="text"
                          value={templateData.angkatan}
                          onChange={(e) =>
                            handleTemplateChange("angkatan", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Contoh: 23"
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
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                tanggal_mulai: e.target.value,
                              })
                            }
                            min={getTodayDate()}
                            className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
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
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                tanggal_selesai: e.target.value,
                              })
                            }
                            min={formData.tanggal_mulai || getTodayDate()}
                            className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Keterangan Tambahan
                      </label>
                      <textarea
                        value={templateData.keterangan}
                        onChange={(e) =>
                          handleTemplateChange("keterangan", e.target.value)
                        }
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Masukkan keterangan detail kegiatan..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Batas Waktu Pelaporan
                        </label>
                        <input
                          type="date"
                          value={templateData.tanggal_pelaporan}
                          onChange={(e) =>
                            handleTemplateChange(
                              "tanggal_pelaporan",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Link Pelaporan
                        </label>
                        <input
                          type="text"
                          value={templateData.link_pelaporan}
                          onChange={(e) =>
                            handleTemplateChange(
                              "link_pelaporan",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://s.id/bbpmpjabar_2025"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pencarian dan Pemilihan Pegawai */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Pilih Peserta Kegiatan
                        </h3>
                        <p className="text-sm text-gray-600">
                          Pilih pegawai yang akan mengikuti kegiatan
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Terpilih: {selectedPegawai.length} pegawai
                        </span>
                        <button
                          type="button"
                          onClick={checkAvailability}
                          disabled={
                            checkingAvailability ||
                            !formData.tanggal_mulai ||
                            selectedPegawai.length === 0
                          }
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
                    <div className="max-h-96 overflow-y-auto p-2 space-y-3">
                      {filteredPegawai.map((pegawai) => {
                        const isSelected = selectedPegawai.some(
                          (p) => p.nip === pegawai.nip
                        );
                        const isAvailable = availabilityStatus[pegawai.nip];

                        return (
                          <div
                            key={pegawai.nip}
                            onClick={() => togglePegawaiSelection(pegawai)}
                            className={`p-4 border rounded-xl cursor-pointer transition-all ${
                              isSelected
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                      isSelected
                                        ? "border-blue-500 bg-blue-500"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {isSelected && (
                                      <CheckCircle className="w-4 h-4 text-white" />
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900">
                                      {pegawai.nama}
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                      NIP: {pegawai.nip}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-3 ml-9 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded">
                                      {pegawai.jabatan}
                                    </span>
                                    {pegawai.pangkat && (
                                      <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                        {pegawai.pangkat}
                                      </span>
                                    )}
                                    <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-800 rounded">
                                      {pegawai.golongan}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600">
                                    {pegawai.unit_kerja || "-"}
                                  </p>
                                </div>

                                {/* Availability Status */}
                                {isSelected && isAvailable !== undefined && (
                                  <div className="mt-3 ml-9 flex items-center gap-2">
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
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
                          setFormData({
                            judul: "",
                            deskripsi: "",
                            tanggal_mulai: "",
                            tanggal_selesai: "",
                            lokasi: "",
                            penyelenggara: "",
                            peserta: [],
                            angkatan: "",
                            keterangan: "",
                            tanggal_pelaporan: "",
                            link_pelaporan: "",
                            nomor_surat_pendukung: "",
                            tanggal_surat_pendukung: "",
                          });
                          setTemplateData({
                            angkatan: "",
                            keterangan: "",
                            tanggal_pelaporan: "",
                            link_pelaporan: "",
                            nomor_surat_pendukung: "",
                            tanggal_surat_pendukung: "",
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

              {/* Preview Surat - Kanan */}
              <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden h-fit">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Preview Surat
                    </h2>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                    >
                      <Printer className="w-4 h-4" />
                      Cetak
                    </button>
                  </div>
                  <p className="text-gray-600 mt-2">
                    Pratinjau surat tugas yang akan dibuat
                  </p>
                </div>

                <div className="p-6">
                  <div className="border border-gray-300 rounded-lg overflow-hidden font-['Times_New_Roman',Times,serif]">
                    {/* Kop Surat - Format Resmi Final */}
                    <div className="border-b border-gray-300">
                      <div className="p-6">
                        <div className="relative">
                          {/* Logo di Kiri */}
                          <div className="absolute left-0 top-0 w-16 h-16 bg-white rounded-lg flex items-center justify-center border border-white">
                            <img
                              src="/tutwuri_bw.png"
                              alt="Logo Kemendikbud"
                              className="w-12 h-12"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src =
                                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z'%3E%3C/path%3E%3Cline x1='4' y1='22' x2='4' y2='15'%3E%3C/line%3E%3C/svg%3E";
                              }}
                            />
                          </div>

                          {/* Teks kop surat - Rata Tengah dengan margin untuk logo */}
                          <div className="ml-20 text-center leading-tight">
                            <div className="text-[13px] font-bold uppercase tracking-tight">
                              KEMENTERIAN PENDIDIKAN DASAR DAN
                            </div>
                            <div className="text-[13px] font-bold uppercase tracking-tight">
                              MENENGAH
                            </div>
                            <div className="text-[13px] font-bold uppercase tracking-tight">
                              BALAI BESAR PENJAMINAN MUTU PENDIDIKAN
                            </div>
                            <div className="text-[13px] font-bold uppercase tracking-tight">
                              PROVINSI JAWA BARAT
                            </div>
                            <div className="text-[11px] text-gray-600 mt-1 leading-snug">
                              Jalan Raya Batujajar.Km.2 Nomor 90 Kecamatan
                              Radalarang - Kabupaten Bandung Barat
                            </div>
                            <div className="text-[11px] text-gray-600 leading-snug">
                              Telepon (022) 6866152
                            </div>
                            <div className="text-[11px] text-gray-600 leading-snug">
                              Laman https://www.bbpmpjabar.id
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Isi Surat */}
                    <div className="p-6 space-y-6">
                      {/* Header Surat */}
                      <div className="text-center">
                        <div className="text-lg font-bold uppercase">
                          SURAT TUGAS
                        </div>
                        <div className="text-sm">
                          Nomor: {formData.nomor_surat || ".../BBPMP-JB/..."}
                        </div>
                      </div>

                      {/* Body Surat */}
                      <div className="space-y-4 text-sm leading-relaxed">
                        <div>
                          <span className="font-bold">
                            {formData.judul || "[Judul Kegiatan]"}
                          </span>
                          {templateData.nomor_surat_pendukung && (
                            <p className="mt-1">
                              Menindaklanjuti surat dari{" "}
                              {formData.penyelenggara || "[Penyelenggara]"}{" "}
                              Nomor: {templateData.nomor_surat_pendukung}
                              {templateData.tanggal_surat_pendukung &&
                                ` tanggal ${formatDateShort(
                                  templateData.tanggal_surat_pendukung
                                )}`}
                              , Kepala Balai Besar Penjaminan Mutu Pendidikan
                              (BBPMP) Provinsi Jawa Barat menugaskan:
                            </p>
                          )}
                        </div>

                        {/* Tabel Peserta */}
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-300 text-xs">
                            <thead>
                              <tr className="bg-gray-400">
                                <th className="border border-black p-2">
                                  No
                                </th>
                                <th className="border border-black p-2">
                                  Nama, NIP, Pangkat Golongan
                                </th>
                                <th className="border border-black p-2">
                                  Jabatan
                                </th>
                                <th className="border border-black p-2">
                                  Angkatan
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedPegawai.length > 0 ? (
                                selectedPegawai.map((pegawai, index) => (
                                  <tr key={pegawai.nip}>
                                    <td className="border border-black p-2 text-center">
                                      {index + 1}
                                    </td>
                                    <td className="border border-black p-2">
                                      {pegawai.nama}, {pegawai.nip},{" "}
                                      {pegawai.pangkat} {pegawai.golongan}
                                    </td>
                                    <td className="border border-black p-2">
                                      {pegawai.jabatan}
                                    </td>
                                    <td className="border border-black p-2 text-center">
                                      {templateData.angkatan || "-"}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td className="border border-black p-2 text-center">
                                    1
                                  </td>
                                  <td className="border border-black p-2">
                                    [Nama], [NIP], [Pangkat Golongan]
                                  </td>
                                  <td className="border border-black p-2">
                                    [Jabatan]
                                  </td>
                                  <td className="border border-black p-2 text-center">
                                    [Angkatan]
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Keterangan */}
                        {templateData.keterangan && (
                          <div>
                            <p className="text-justify">
                              {templateData.keterangan}
                            </p>
                          </div>
                        )}

                        {/* Detail Kegiatan */}
                        <div>
                          <p className="font-bold">
                            Untuk menjadi Peserta{" "}
                            {formData.judul || "[Nama Kegiatan]"}
                          </p>
                          {templateData.angkatan && (
                            <p>
                              Angkatan {templateData.angkatan} di lingkungan{" "}
                              {formData.penyelenggara || "[Penyelenggara]"}
                            </p>
                          )}
                          {formData.tanggal_mulai &&
                            formData.tanggal_selesai && (
                              <p>
                                yang dilaksanakan pada tanggal{" "}
                                {formatDateShort(formData.tanggal_mulai)} s.d.{" "}
                                {formatDateShort(formData.tanggal_selesai)}{" "}
                                {formData.tahun || "2025"}, dengan rincian
                                kegiatan sebagai berikut:
                              </p>
                            )}
                          {formData.lokasi && (
                            <p>- Bertempat di: {formData.lokasi}</p>
                          )}
                        </div>

                        {/* Template bagian bawah */}
                        <div className="text-justify mt-16">
                            <p>
                                Surat tugas ini dibuat, untuk dilaksanakan dengan penuh 
                                tanggung jawab serta mengumpulkan laporan pada tautan: https://s.id/bbpmpjabar_2025 
                                paling lambat 3 hari setelah pelaksanaan tugas.
                            </p>  
                        </div>
                        <div className="text-justify">
                            <p>
                                Dalam rangka membangun ZI WBBM, 
                                pegawai BBPMP Provinsi Jawa Barat tidak menerima gratifikasi dalam bentuk apapun saat melaksanakan tugas.  
                            </p>
                        </div>
                        <div className="text-justify">
                            <p>
                                Jika ada keluhan dan/atau ketidakpuasan terhadap penyalahgunaan wewenang, 
                                pelanggaran disiplin dan pelanggaran kedinasan dan kinerja pegawai BBPMP Jawa Barat, 
                                dapat dilaporkan melalui tautan : https://s.id/dumas_bbpmpjabar    
                            </p>
                        </div>



                        {/* Tanda Tangan */}
                        <div className="text-right mt-16">
                          <div className="inline-block text-center">
                            <div>
                              Bandung,{" "}
                              {formatDateShort(
                                new Date().toISOString().split("T")[0]
                              )}
                            </div>
                            <div className="text-left mt-1">Kepala,</div>
                            <div className="mt-12 font-bold">
                              Komalasari, S.Rd., M.Ed.
                            </div>
                            <div>NIP 197812252002122003</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
