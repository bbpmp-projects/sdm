// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginForm from "./components/LoginForm/LoginForm";
import WelcomeSection from "./components/UILoginForm/WelcomeSection";
import BackgroundElements from "./components/UILoginForm/BackgroundElements";

export default function Login() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // Cek token dengan useEffect
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          // Optional: Validasi token di sini
          router.push('/dashboard');
        } else {
          setIsChecking(false);
        }
      } else {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-50"
      suppressHydrationWarning
    >
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

      {/* Left Side - Welcome Section */}
      <WelcomeSection />

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        <BackgroundElements />
        <LoginForm />
      </div>
    </div>
  );
}