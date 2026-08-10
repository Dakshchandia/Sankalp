"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Onboarding not used in JWT flow — redirect to login
export default function OnboardingPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/login"); }, [router]);
  return null;
}
