"use client";

import { motion } from "framer-motion";
import { Star, Quote, ShieldCheck } from "lucide-react";

const testimonials = [
  {
    quote: "SANKALP has completely eliminated proxy attendance in our block. Supervisors finish attendance verification in minutes, and workers get paid transparently.",
    author: "Rajesh Kumar",
    role: "Block Development Officer",
    location: "Ranchi District",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },
  {
    quote: "Earlier wage disputes took weeks to solve. Now with instant photo matches and timestamped proof, every single worker knows their exact wage payout.",
    author: "Ananya Sharma",
    role: "Department Supervisor",
    location: "Patna Zone",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },
  {
    quote: "Scanning face at start of work is so fast and easy. Even elderly workers with worn fingerprints log attendance effortlessly without any delay.",
    author: "Suresh Mahto",
    role: "Senior Rural Works Specialist",
    location: "Dhanbad Division",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-xs uppercase font-bold tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full inline-block border border-teal-200/60">
            Field Testimonials
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Trusted by Supervisors & Administrative Officers
          </h3>
          <p className="text-slate-600 text-base">
            Real feedback from ground implementation across government departments.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-7 flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative group"
            >
              <div>
                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-amber-400 mb-5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-slate-700 text-sm leading-relaxed italic mb-6">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/60 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    {t.author}
                    <ShieldCheck className="w-4 h-4 text-teal-600 inline" />
                  </div>
                  <div className="text-xs text-slate-500">
                    {t.role} • {t.location}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
