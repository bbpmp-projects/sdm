"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  IdCard,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Interface untuk data user
interface UserData {
  nama_sesuai_ktp: string;
  nip: string;
  golongan: string;
  jabatan: string;
  unit_kerja: string;
  nomor_hp: string;
  alamat_email: string;
  password: string;
  konfirmasi_password: string;
}

// Data jabatan sesuai permintaan
const JABATAN_OPTIONS = [
  "Arsiparis Ahli Madya",
  "Arsiparis Ahli Muda",
  "Kepala",
  "Kepala Bagian Umum",
  "Operator Layanan Operasional",
  "Penelaah Informasi dan Komunikasi Publik",
  "Penelaah Teknis Kebijakan",
  "Pengadministrasi Perkantoran",
  "Pengelola Sistem dan Teknologi Informasi",
  "Pengelola Umum Operasional",
  "Pengolah Data dan Informasi",
  "Petugas Penggandaan",
  "Teknisi Sarana dan Prasarana",
  "Widyaprada Ahli Madya",
  "Widyaprada Ahli Muda",
  "Widyaprada Ahli Pertama",
];

export default function Register() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showKonfirmasiPassword, setShowKonfirmasiPassword] = useState(false);
  const [showJabatanDropdown, setShowJabatanDropdown] = useState(false);

  const [formData, setFormData] = useState<UserData>({
    nama_sesuai_ktp: "",
    nip: "",
    golongan: "",
    jabatan: "",
    unit_kerja: "",
    nomor_hp: "",
    alamat_email: "",
    password: "",
    konfirmasi_password: "",
  });

  const [errors, setErrors] = useState({
    nomor_hp: "",
    password: "",
    konfirmasi_password: "",
    nip: "",
  });

  const API_BASE_URL = "http://localhost:3000";

  // Validasi konfirmasi password
  const validatePasswordMatch = useCallback(
    (password: string, konfirmasi_password: string) => {
      if (password && konfirmasi_password && password !== konfirmasi_password) {
        return "Password dan konfirmasi password tidak sama";
      }
      return "";
    },
    []
  );

  // Validasi input NIP (hanya angka, maksimal 18 digit)
  const handleNipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\D/g, "");
    value = value.slice(0, 18);

    setFormData((prev) => ({
      ...prev,
      nip: value,
    }));

    if (value.length > 0 && value.length !== 18) {
      setErrors((prev) => ({
        ...prev,
        nip: "NIP harus 18 digit",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        nip: "",
      }));
    }
  };

  // Validasi input nomor HP (hanya angka, maksimal 13 digit)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\D/g, "");
    value = value.slice(0, 13);

    setFormData((prev) => ({
      ...prev,
      nomor_hp: value,
    }));

    if (value.length > 0 && value.length > 13) {
      setErrors((prev) => ({
        ...prev,
        nomor_hp: "Nomor HP maksimal 13 digit",
      }));
    } else if (value.length > 0 && value.length < 10) {
      setErrors((prev) => ({
        ...prev,
        nomor_hp: "Nomor HP minimal 10 digit",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        nomor_hp: "",
      }));
    }
  };

  // Handle paste event untuk mencegah paste lebih dari batas
  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    maxLength: number
  ) => {
    const pastedData = e.clipboardData.getData("text");
    if (pastedData.replace(/\D/g, "").length > maxLength) {
      e.preventDefault();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newFormData = {
        ...prev,
        [name]: value,
      };

      // Validasi konfirmasi password setelah state ter-update
      setTimeout(() => {
        if (name === "password" || name === "konfirmasi_password") {
          const passwordError = validatePasswordMatch(
            newFormData.password,
            newFormData.konfirmasi_password
          );
          setErrors((prevErrors) => ({
            ...prevErrors,
            konfirmasi_password: passwordError,
          }));
        }
      }, 0);

      return newFormData;
    });
  };

  // Fungsi untuk memilih jabatan dari dropdown
  const handleSelectJabatan = (jabatan: string) => {
    setFormData((prev) => ({
      ...prev,
      jabatan: jabatan,
    }));
    setShowJabatanDropdown(false);
  };

  // Fungsi untuk search jabatan
  const [searchJabatan, setSearchJabatan] = useState("");
  
  const filteredJabatanOptions = JABATAN_OPTIONS.filter((jabatan) =>
    jabatan.toLowerCase().includes(searchJabatan.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#jabatan-dropdown') && !target.closest('#jabatan-input')) {
        setShowJabatanDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const validateForm = () => {
    const newErrors = {
      nomor_hp: "",
      password: "",
      konfirmasi_password: "",
      nip: "",
    };

    let isValid = true;

    // Validasi NIP - harus tepat 18 digit (jika diisi)
    if (formData.nip && formData.nip.length !== 18) {
      newErrors.nip = "NIP harus 18 digit";
      isValid = false;
    }

    // Validasi nomor HP
    if (formData.nomor_hp.length > 13) {
      newErrors.nomor_hp = "Nomor HP maksimal 13 digit";
      isValid = false;
    }
    if (formData.nomor_hp.length < 10) {
      newErrors.nomor_hp = "Nomor HP minimal 10 digit";
      isValid = false;
    }

    // Validasi password
    if (formData.password.length < 8) {
      newErrors.password = "Password minimal 8 karakter";
      isValid = false;
    }

    // Validasi konfirmasi password
    const passwordMatchError = validatePasswordMatch(
      formData.password,
      formData.konfirmasi_password
    );
    if (passwordMatchError) {
      newErrors.konfirmasi_password = passwordMatchError;
      isValid = false;
    }

    // Validasi field required
    if (!formData.alamat_email || !formData.nama_sesuai_ktp) {
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("❌ Harap perbaiki error pada form sebelum submit");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        nama_sesuai_ktp: formData.nama_sesuai_ktp,
        nip: formData.nip,
        golongan: formData.golongan,
        jabatan: formData.jabatan,
        unit_kerja: formData.unit_kerja,
        nomor_hp: formData.nomor_hp,
        alamat_email: formData.alamat_email,
        password: formData.password,
        konfirmasi_password: formData.konfirmasi_password,
      };

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          "🎉 Registrasi berhasil! Mengarahkan ke halaman verifikasi..."
        );

        // Simpan nomor HP ke sessionStorage untuk digunakan di halaman verifikasi WhatsApp
        sessionStorage.setItem("verification_nomor_hp", formData.nomor_hp);

        // Redirect ke halaman verifikasi setelah 2 detik
        setTimeout(() => {
          router.push("/register/verifikasi");
        }, 2000);
      } else {
        let errorMessage =
          data.message || data.error || "❌ Gagal melakukan registrasi";

        if (
          data.message?.includes("duplicate") ||
          data.message?.includes("sudah ada")
        ) {
          if (data.message.includes("alamat_email")) {
            errorMessage = "❌ Email sudah terdaftar";
          } else if (data.message.includes("nomor_hp")) {
            errorMessage = "❌ Nomor HP sudah terdaftar";
          } else if (data.message.includes("nip")) {
            errorMessage = "❌ NIP sudah terdaftar";
          }
        }

        if (data.errors && data.errors.length > 0) {
          errorMessage = `❌ ${data.errors.join(", ")}`;
        }

        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error("🔌 Koneksi ke server gagal. Periksa koneksi internet Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.alamat_email) {
      toast.error("❌ Masukkan email terlebih dahulu");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/resend-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.alamat_email }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("📧 Email verifikasi telah dikirim ulang");
      } else {
        toast.error(data.message || "❌ Gagal mengirim ulang verifikasi");
      }
    } catch (error) {
      toast.error("🔌 Koneksi ke server gagal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="rounded-xl shadow-lg"
        bodyClassName="font-medium"
      />

      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-4xl">
        {/* Back Button */}
        <Link
          href="/"
          className="absolute -top-16 left-0 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors mb-4 font-medium group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
          Kembali ke halaman login
        </Link>

        {/* Card Container */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/60 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6">
              <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-blue-100">
                <img
                  src="/logo_bbpmp.png"
                  alt="BBPMP Logo"
                  className="w-20 h-20 object-contain"
                />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-800">BBPMP</h2>
                <p className="text-blue-600 text-lg font-semibold">
                  Balai Besar Penjaminan Mutu Pendidikan
                </p>
                <p className="text-gray-600 text-base font-medium mt-1">
                  Provinsi Jawa Barat
                </p>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Daftar Akun Baru
            </h1>
            <p className="text-gray-600 mt-3 font-medium max-w-2xl mx-auto">
              Lengkapi data diri Anda untuk bergabung dengan platform
              Nyurat-Keun
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Kolom Kiri - Data Pribadi */}
              <div className="space-y-6">
                {/* Data Pribadi */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Data Pribadi
                  </h3>

                  <div className="space-y-4">
                    {/* Nama Sesuai KTP */}
                    <div className="space-y-2">
                      <label
                        htmlFor="nama_sesuai_ktp"
                        className="text-sm font-medium text-gray-700"
                      >
                        Nama Sesuai KTP *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-blue-500" />
                        </div>
                        <input
                          type="text"
                          id="nama_sesuai_ktp"
                          name="nama_sesuai_ktp"
                          value={formData.nama_sesuai_ktp}
                          onChange={(e) => {
                            const value = e.target.value.toUpperCase();
                            setFormData((prev) => ({
                              ...prev,
                              nama_sesuai_ktp: value,
                            }));
                          }}
                          required
                          className="w-full pl-11 pr-4 py-3 bg-white border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 shadow-sm"
                          placeholder="Masukkan nama lengkap sesuai KTP"
                        />
                      </div>
                    </div>

                    {/* NIP */}
                    <div className="space-y-2">
                      <label
                        htmlFor="nip"
                        className="text-sm font-medium text-gray-700"
                      >
                        NIP
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <IdCard className="h-5 w-5 text-blue-500" />
                        </div>
                        <input
                          type="text"
                          id="nip"
                          name="nip"
                          value={formData.nip}
                          onChange={handleNipChange}
                          onPaste={(e) => handlePaste(e, 18)}
                          inputMode="numeric"
                          className={`w-full pl-11 pr-4 py-3 bg-white border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 shadow-sm ${
                            errors.nip
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                              : "border-blue-100"
                          }`}
                          placeholder="18 digit NIP (opsional)"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          {formData.nip.length}/18 digit
                        </p>
                        {errors.nip && (
                          <p className="text-xs text-red-600 font-medium">
                            {errors.nip}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Nomor HP */}
                    <div className="space-y-2">
                      <label
                        htmlFor="nomor_hp"
                        className="text-sm font-medium text-gray-700"
                      >
                        Nomor HP (WhatsApp) *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-blue-500" />
                        </div>
                        <input
                          type="tel"
                          id="nomor_hp"
                          name="nomor_hp"
                          value={formData.nomor_hp}
                          onChange={handlePhoneChange}
                          onPaste={(e) => handlePaste(e, 13)}
                          required
                          inputMode="numeric"
                          className={`w-full pl-11 pr-4 py-3 bg-white border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 shadow-sm ${
                            errors.nomor_hp
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                              : "border-blue-100"
                          }`}
                          placeholder="Contoh: 081234567890"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          {formData.nomor_hp.length}/13 digit
                        </p>
                        {errors.nomor_hp && (
                          <p className="text-xs text-red-600 font-medium">
                            {errors.nomor_hp}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-blue-600 font-medium">
                        📱 Kode verifikasi akan dikirim ke nomor WhatsApp ini
                      </p>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label
                        htmlFor="alamat_email"
                        className="text-sm font-medium text-gray-700"
                      >
                        Alamat Email *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-blue-500" />
                        </div>
                        <input
                          type="email"
                          id="alamat_email"
                          name="alamat_email"
                          value={formData.alamat_email}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-11 pr-4 py-3 bg-white border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 shadow-sm"
                          placeholder="masukkan@email.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan - Data Kepegawaian & Keamanan */}
              <div className="space-y-6">
                {/* Data Kepegawaian */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Data Kepegawaian
                  </h3>

                  <div className="space-y-4">
                    {/* Golongan */}
                    <div className="space-y-2">
                      <label
                        htmlFor="golongan"
                        className="text-sm font-medium text-gray-700"
                      >
                        Golongan
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          id="golongan"
                          name="golongan"
                          value={formData.golongan}
                          onChange={handleInputChange}
                          className="w-full pl-4 pr-4 py-3 bg-white border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 shadow-sm"
                          placeholder="Contoh: III/A"
                        />
                      </div>
                    </div>

                    {/* Jabatan - Custom Dropdown */}
                    <div className="space-y-2">
                      <label
                        htmlFor="jabatan"
                        className="text-sm font-medium text-gray-700"
                      >
                        Jabatan
                      </label>
                      <div className="relative" id="jabatan-dropdown">
                        <div className="relative group" id="jabatan-input">
                          <input
                            type="text"
                            id="jabatan"
                            name="jabatan"
                            value={formData.jabatan}
                            readOnly
                            onClick={() => setShowJabatanDropdown(!showJabatanDropdown)}
                            className="w-full pl-4 pr-12 py-3 bg-white border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 shadow-sm cursor-pointer"
                            placeholder="Pilih jabatan"
                          />
                          <div 
                            className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
                          >
                            <ChevronDown className={`h-5 w-5 text-blue-500 transition-transform ${showJabatanDropdown ? 'transform rotate-180' : ''}`} />
                          </div>
                        </div>

                        {/* Dropdown Menu */}
                        {showJabatanDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border-2 border-blue-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            {/* Search Input */}
                            <div className="p-2 border-b border-blue-50">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={searchJabatan}
                                  onChange={(e) => setSearchJabatan(e.target.value)}
                                  className="w-full pl-3 pr-3 py-2 bg-blue-50 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                  placeholder="Cari jabatan..."
                                  autoFocus
                                />
                              </div>
                            </div>

                            {/* Options List */}
                            <div className="max-h-48 overflow-y-auto">
                              {filteredJabatanOptions.length > 0 ? (
                                filteredJabatanOptions.map((jabatan, index) => (
                                  <div
                                    key={index}
                                    onClick={() => handleSelectJabatan(jabatan)}
                                    className={`px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors ${
                                      formData.jabatan === jabatan
                                        ? "bg-blue-50 text-blue-700 font-medium"
                                        : "text-gray-700"
                                    } ${index !== filteredJabatanOptions.length - 1 ? "border-b border-blue-50" : ""}`}
                                  >
                                    <div className="flex items-center">
                                      <div className={`w-2 h-2 rounded-full mr-3 ${
                                        formData.jabatan === jabatan
                                          ? "bg-blue-500"
                                          : "bg-blue-200"
                                      }`}></div>
                                      {jabatan}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="px-4 py-3 text-gray-500 text-center">
                                  Tidak ditemukan jabatan yang sesuai
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Pilih salah satu dari {JABATAN_OPTIONS.length} pilihan jabatan yang tersedia
                      </p>
                    </div>

                    {/* Unit Kerja */}
                    <div className="space-y-2">
                      <label
                        htmlFor="unit_kerja"
                        className="text-sm font-medium text-gray-700"
                      >
                        Unit Kerja
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          id="unit_kerja"
                          name="unit_kerja"
                          value={formData.unit_kerja}
                          onChange={handleInputChange}
                          className="w-full pl-4 pr-4 py-3 bg-white border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 shadow-sm"
                          placeholder="Masukkan unit kerja"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Keamanan Akun */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Keamanan Akun
                  </h3>

                  <div className="space-y-4">
                    {/* Password */}
                    <div className="space-y-2">
                      <label
                        htmlFor="password"
                        className="text-sm font-medium text-gray-700"
                      >
                        Password *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-blue-500" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          minLength={8}
                          className={`w-full pl-11 pr-12 py-3 bg-white border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 shadow-sm ${
                            errors.password
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                              : "border-blue-100"
                          }`}
                          placeholder="Masukkan password (min. 8 karakter)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-blue-50 rounded-xl p-1 transition-all duration-200"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Eye className="h-5 w-5 text-blue-600" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-xs text-red-600 font-medium">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    {/* Konfirmasi Password */}
                    <div className="space-y-2">
                      <label
                        htmlFor="konfirmasi_password"
                        className="text-sm font-medium text-gray-700"
                      >
                        Konfirmasi Password *
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-blue-500" />
                        </div>
                        <input
                          type={showKonfirmasiPassword ? "text" : "password"}
                          id="konfirmasi_password"
                          name="konfirmasi_password"
                          value={formData.konfirmasi_password}
                          onChange={handleInputChange}
                          required
                          className={`w-full pl-11 pr-12 py-3 bg-white border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 shadow-sm ${
                            errors.konfirmasi_password
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                              : "border-blue-100"
                          }`}
                          placeholder="Konfirmasi password Anda"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowKonfirmasiPassword(!showKonfirmasiPassword)
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-blue-50 rounded-xl p-1 transition-all duration-200"
                        >
                          {showKonfirmasiPassword ? (
                            <EyeOff className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Eye className="h-5 w-5 text-blue-600" />
                          )}
                        </button>
                      </div>
                      {errors.konfirmasi_password && (
                        <p className="text-xs text-red-600 font-medium">
                          {errors.konfirmasi_password}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <div className="relative mt-1">
                      <input
                        type="checkbox"
                        required
                        className="w-5 h-5 text-blue-600 bg-white border-2 border-blue-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                      />
                    </div>
                    <span className="text-sm text-gray-700 leading-relaxed">
                      Saya menyetujui{" "}
                      <a
                        href="#"
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        Syarat & Ketentuan
                      </a>{" "}
                      dan{" "}
                      <a
                        href="#"
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        Kebijakan Privasi
                      </a>{" "}
                      platform Nyurat-Keun
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={
                  isLoading ||
                  !!errors.nomor_hp ||
                  !!errors.password ||
                  !!errors.konfirmasi_password ||
                  !!errors.nip
                }
                className="w-full max-w-md bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:shadow"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memproses Pendaftaran...</span>
                  </>
                ) : (
                  <>
                    <span>Daftar Sekarang</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center pt-6 border-t border-blue-100">
            <p className="text-gray-700 font-medium">
              Sudah punya akun?{" "}
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 font-semibold transition-colors inline-flex items-center gap-2 group"
              >
                Masuk di sini
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm font-medium">
            © 2025 BBPMP - Nyurat-Keun. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}