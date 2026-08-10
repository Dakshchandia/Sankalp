"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect to the JWT login page — Clerk is not used in this project
export default function SignInPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/login"); }, [router]);
  return null;
}
