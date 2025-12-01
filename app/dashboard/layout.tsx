import { Metadata } from 'next';
import ToastProvider from './ToastProvider';

export const metadata: Metadata = {
  title: "Dashboard - Nyurat-Keun",
  description: "Dashboard platform pembelajaran digital Nyurat-Keun",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <ToastProvider />
    </>
  );
}