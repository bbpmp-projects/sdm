// app/components/LoginForm/PasswordInput.tsx
import { Lock, Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
}

export default function PasswordInput({
  value,
  onChange,
  showPassword,
  onTogglePassword,
}: PasswordInputProps) {
  return (
    <div className="space-y-3">
      <label
        htmlFor="password"
        className="text-sm font-semibold text-gray-800"
      >
        Password
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform duration-200 group-focus-within:scale-110">
          <Lock className="h-5 w-5 text-blue-500" />
        </div>
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="w-full pl-11 pr-12 py-3.5 bg-white/70 border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 shadow-sm text-gray-900 font-medium hover:border-blue-300 focus:bg-white"
          placeholder="Masukkan password"
        />
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-blue-50 rounded-xl p-1 transition-all duration-200 hover:scale-110"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5 text-blue-600 hover:text-blue-800 transition-colors" />
          ) : (
            <Eye className="h-5 w-5 text-blue-600 hover:text-blue-800 transition-colors" />
          )}
        </button>
      </div>
    </div>
  );
}