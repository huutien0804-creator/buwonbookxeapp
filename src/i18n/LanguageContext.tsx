import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations, Translations } from './translations';
import { BookingStatus, VehicleStatus, VehicleType, UserRole, TripType } from '../types/fleet';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: Translations;
  getBookingStatusLabel: (status: BookingStatus) => string;
  getVehicleStatusLabel: (status: VehicleStatus) => string;
  getVehicleTypeLabel: (type: VehicleType | string) => string;
  getTripTypeLabel: (type: TripType) => string;
  getRoleLabel: (role: UserRole) => string;
  formatNumber: (num: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('autofleet_lang');
      if (saved === 'en' || saved === 'vi') return saved;
    } catch {
      // ignore
    }
    return 'vi';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('autofleet_lang', newLang);
      document.documentElement.lang = newLang;
    } catch {
      // ignore
    }
  };

  const toggleLang = () => {
    setLang(lang === 'vi' ? 'en' : 'vi');
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = translations[lang];

  const getBookingStatusLabel = (status: BookingStatus): string => {
    return t.bookingStatus[status] || status;
  };

  const getVehicleStatusLabel = (status: VehicleStatus): string => {
    return t.vehicleStatus[status] || status;
  };

  const getVehicleTypeLabel = (type: VehicleType | string): string => {
    const known = t.vehicleType[type as VehicleType];
    if (known) return known;
    if (type === 'sedan_4') return lang === 'vi' ? 'Sedan 4-5 chỗ' : 'Sedan 4-5 Seats';
    if (type === 'suv_7') return lang === 'vi' ? 'SUV 7 chỗ' : 'SUV 7 Seats';
    if (type === 'van_16') return lang === 'vi' ? 'Xe 16 chỗ' : '16-Seat Van';
    if (type === 'pickup') return lang === 'vi' ? 'Bán tải' : 'Pickup Truck';
    return type;
  };

  const getTripTypeLabel = (type: TripType): string => {
    return t.tripType[type] || type;
  };

  const getRoleLabel = (role: UserRole): string => {
    return t.roles[role] || role;
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US');
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        t,
        getBookingStatusLabel,
        getVehicleStatusLabel,
        getVehicleTypeLabel,
        getTripTypeLabel,
        getRoleLabel,
        formatNumber,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
