import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';

type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
});

export function useLanguage(): LanguageContextType {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem('ymr_language', lang);
    setLanguageState(lang);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('ymr_language');
    if (saved === 'pt' || saved === 'en') {
      setLanguageState(saved);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
