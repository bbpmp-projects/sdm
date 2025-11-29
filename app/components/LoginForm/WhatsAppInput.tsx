// app/components/LoginForm/WhatsAppInput.tsx
import { Phone } from "lucide-react";

interface WhatsAppInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function WhatsAppInput({ value, onChange }: WhatsAppInputProps) {
  return (
    <div className="space-y-3">
      <label
        htmlFor="nomor_hp"
        className="text-sm font-semibold text-gray-800"
      >
        Nomor WhatsApp
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform duration-200 group-focus-within:scale-110">
          <Phone className="h-5 w-5 text-blue-500" />
        </div>
        <input
          type="tel"
          id="nomor_hp"
          name="nomor_hp"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="w-full pl-11 pr-4 py-3.5 bg-white/70 border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 shadow-sm text-gray-900 font-medium hover:border-blue-300 focus:bg-white"
          placeholder="Masukkan Nomor"
          pattern="08[0-9]{8,11}"
          maxLength={13}
        />
      </div>
    </div>
  );
}