"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Activity, Zap, Globe } from "lucide-react";
import SplashScreen from "@/components/SplashScreen";

/* ─── Landing content (Sankalp 2 style) ─── */
function LandingContent() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A1F13] text-slate-200 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">

      {/* ── Navigation ── */}
      <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${
        scrolled ? "bg-[#0A1F13]/80 backdrop-blur-md border-b border-white/5 py-4" : "bg-transparent py-6"
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-md">
              <img src="/logo.png" alt="SANKALP Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold text-lg text-white tracking-tight">SANKALP</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#about"    className="hover:text-white transition-colors">About</a>
            <a href="#contact"  className="hover:text-white transition-colors">Contact</a>
          </div>
          <div>
            <Link
              href="/role-selection"
              className="px-5 py-2 text-sm font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all active:scale-95"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex items-center justify-center min-h-[90vh]">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img src="/bg.jpg" alt="Agriculture Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(10,31,19,0.4)] via-[rgba(10,31,19,0.8)] to-[#0A1F13]" />
        </div>

        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen z-0" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen z-0" />

        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
              <Zap className="w-3.5 h-3.5" />
              <span>The New Standard in Workforce Management</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              Empower your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400">
                field operations.
              </span>
            </h1>

            <p className="text-lg text-slate-400 mb-8 max-w-2xl leading-relaxed">
              Seamlessly manage rural workforce attendance, verification, and wages with an enterprise-grade platform built for scale and transparency.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              <Link
                href="/role-selection"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-full shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-full border border-white/10 transition-all flex items-center justify-center gap-2">
                Learn More
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 bg-[#0A1F13] relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Engineered for Reliability</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Everything you need to verify, manage, and scale your workforce.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: "Tamper-Proof Verification",    desc: "AI-driven face scans ensure accurate attendance without proxies." },
              { icon: Activity,    title: "Real-Time Insights",           desc: "Live dashboards for supervisors to monitor daily operational metrics." },
              { icon: Globe,       title: "Cloud-Native Infrastructure",  desc: "Secure, highly available, and instantly scalable for any project size." },
            ].map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all group cursor-default"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-20 bg-[#071A0D] border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">About SANKALP</h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-6">
            SANKALP (System for Attendance, Networking, Knowledge, Accountability, Livelihood & Payroll) is a Digital India initiative designed to modernize rural workforce management through AI-powered face recognition, transparent wage calculation, and tamper-proof audit trails.
          </p>
          <p className="text-slate-400 leading-relaxed">
            Built for MGNREGA and similar government employment schemes, SANKALP eliminates proxy attendance, ensures every worker is paid fairly, and provides supervisors with real-time insights into their workforce.
          </p>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-20 bg-[#0A1F13] border-t border-white/5">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Contact Us</h2>
          <p className="text-slate-400 mb-8">Have questions? Reach out to the SANKALP team.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:support@sankalp.gov.in" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-full transition-all">
              Email Support
            </a>
            <Link href="/role-selection" className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-full border border-white/10 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 bg-[#0A1F13] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-white flex items-center justify-center">
              <img src="/logo.png" alt="SANKALP Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold text-sm text-white">SANKALP</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>
          <div className="text-sm text-slate-500">
            © {new Date().getFullYear()} SANKALP Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Root Page — Splash then Landing ─── */
export default function Page() {
  const [showSplash, setShowSplash] = useState<boolean | null>(null);

  useEffect(() => {
    setShowSplash(true);
  }, []);

  if (showSplash === null) return null; // avoid hydration mismatch
  if (showSplash === true)  return <SplashScreen onComplete={() => setShowSplash(false)} />;
  return <LandingContent />;
}
