// app/components/LoginForm/LoginTypeSelector.tsx
import { Mail, Phone } from "lucide-react";

interface LoginTypeSelectorProps {
  loginType: "email" | "whatsapp";
  onLoginTypeChange: (type: "email" | "whatsapp") => void;
}

export default function LoginTypeSelector({
  loginType,
  onLoginTypeChange,
}: LoginTypeSelectorProps) {
  return (
    <div className="flex mb-6 bg-blue-50 rounded-xl p-1">
      <button
        type="button"
        onClick={() => onLoginTypeChange("email")}
        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
          loginType === "email"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-600 hover:text-blue-600"
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <Mail className="w-4 h-4" />
          Email
        </div>
      </button>
      <button
        type="button"
        onClick={() => onLoginTypeChange("whatsapp")}
        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
          loginType === "whatsapp"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-600 hover:text-blue-600"
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <Phone className="w-4 h-4" />
          WhatsApp
        </div>
      </button>
    </div>
  );
}