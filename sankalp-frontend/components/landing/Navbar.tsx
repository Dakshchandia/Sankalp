"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, Menu, X, Shield, Sparkles } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform duration-200">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
              SANKALP
              <span className="text-[10px] uppercase font-semibold tracking-wider bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200/60 hidden sm:inline-block">
                Gov Tech
              </span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-teal-700 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-teal-700 transition-colors">
            How It Works
          </a>
          <a href="#benefits" className="hover:text-teal-700 transition-colors">
            Benefits
          </a>
          <a href="#testimonials" className="hover:text-teal-700 transition-colors">
            Testimonials
          </a>
          <a href="#faq" className="hover:text-teal-700 transition-colors">
            FAQ
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.LOGIN}
            className="group relative inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 transition-all duration-200 shadow-md shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-[0.98]"
          >
            <span>Login</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 px-6 py-6 space-y-4 animate-fade-in-up">
          <nav className="flex flex-col gap-3 font-medium text-slate-700 text-base">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              How It Works
            </a>
            <a
              href="#benefits"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Benefits
            </a>
            <a
              href="#testimonials"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Testimonials
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              FAQ
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
