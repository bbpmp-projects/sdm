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

  // Redirect jika sudah login
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

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