"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { LangCode } from "@/lib/i18n";
import { t as translate } from "@/lib/translations";

interface LangContextValue {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangContextValue>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  useEffect(() => {
    const saved = localStorage.getItem("sankalp_lang") as LangCode | null;
    if (saved) setLangState(saved);
  }, []);

  const setLang = (l: LangCode) => {
    setLangState(l);
    localStorage.setItem("sankalp_lang", l);
  };

  const t = (key: string) => translate(key, lang);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
