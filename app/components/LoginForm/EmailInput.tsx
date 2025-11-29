// app/components/LoginForm/EmailInput.tsx
import { Mail } from "lucide-react";

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function EmailInput({ value, onChange }: EmailInputProps) {
  return (
    <div className="space-y-3">
      <label
        htmlFor="alamat_email"
        className="text-sm font-semibold text-gray-800"
      >
        Alamat Email
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform duration-200 group-focus-within:scale-110">
          <Mail className="h-5 w-5 text-blue-500" />
        </div>
        <input
          type="email"
          id="alamat_email"
          name="alamat_email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="w-full pl-11 pr-4 py-3.5 bg-white/70 border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 shadow-sm text-gray-900 font-medium hover:border-blue-300 focus:bg-white"
          placeholder="Masukkan@gmail.com"
        />
      </div>
    </div>
  );
}