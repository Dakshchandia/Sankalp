import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SANKALP — AI-Powered Rural Workforce Management",
  description:
    "Secure face-recognition attendance, transparent wage management, and complete audit trails for government employment schemes.",
  keywords: ["rural workforce", "attendance", "face recognition", "MGNREGA", "Digital India"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B1220",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased" style={{ background: "var(--bg)", color: "var(--text)" }} suppressHydrationWarning>
        <LanguageProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors closeButton toastOptions={{ duration: 4000 }} />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
