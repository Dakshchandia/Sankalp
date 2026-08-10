export const LANGUAGES = [
  { code: "en", label: "English",    flag: "🇬🇧", native: "English"    },
  { code: "hi", label: "Hindi",      flag: "🇮🇳", native: "हिंदी"      },
  { code: "mr", label: "Marathi",    flag: "🇮🇳", native: "मराठी"     },
  { code: "ta", label: "Tamil",      flag: "🇮🇳", native: "தமிழ்"     },
  { code: "te", label: "Telugu",     flag: "🇮🇳", native: "తెలుగు"    },
  { code: "bn", label: "Bengali",    flag: "🇮🇳", native: "বাংলা"     },
  { code: "gu", label: "Gujarati",   flag: "🇮🇳", native: "ગુજરાતી"   },
  { code: "kn", label: "Kannada",    flag: "🇮🇳", native: "ಕನ್ನಡ"    },
  { code: "pa", label: "Punjabi",    flag: "🇮🇳", native: "ਪੰਜਾਬੀ"    },
  { code: "or", label: "Odia",       flag: "🇮🇳", native: "ଓଡ଼ିଆ"    },
];

export type LangCode = typeof LANGUAGES[number]["code"];
