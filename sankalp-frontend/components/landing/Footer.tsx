"use client";

import Link from "next/link";
import { Shield, ArrowUp } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand Column */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-700 flex items-center justify-center text-white font-bold text-sm">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              SANKALP
            </span>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed max-w-md">
            Next-generation transparent workforce management, face-verified attendance, and direct wage disbursal tracking for rural and departmental works.
          </p>

          <div className="text-xs text-slate-500 pt-2">
            © {new Date().getFullYear()} SANKALP GovTech Platform. All rights reserved.
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-white text-sm mb-4">Platform</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <a href="#features" className="hover:text-teal-400 transition-colors">
                Features
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="hover:text-teal-400 transition-colors">
                How It Works
              </a>
            </li>
            <li>
              <a href="#benefits" className="hover:text-teal-400 transition-colors">
                Benefits
              </a>
            </li>
            <li>
              <a href="#testimonials" className="hover:text-teal-400 transition-colors">
                Testimonials
              </a>
            </li>
          </ul>
        </div>

        {/* Access Column */}
        <div>
          <h4 className="font-semibold text-white text-sm mb-4">Access Portal</h4>
          <ul className="space-y-2.5 text-sm mb-6">
            <li>
              <Link href={ROUTES.LOGIN} className="hover:text-teal-400 transition-colors font-medium">
                Manager / Worker Login →
              </Link>
            </li>
          </ul>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-4 py-2.5 rounded-lg transition-colors"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
