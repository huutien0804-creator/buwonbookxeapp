import React, { useState } from 'react';
import { X, MapPin, Navigation, Compass, Fuel, Clock, DollarSign, ArrowRight } from 'lucide-react';
import { POPULAR_LOCATIONS } from '../data/mockData';
import { useLanguage } from '../i18n/LanguageContext';

interface RouteEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRoute?: (origin: string, dest: string, distanceKm: number) => void;
}

export const RouteEstimatorModal: React.FC<RouteEstimatorModalProps> = ({
  isOpen,
  onClose,
  onApplyRoute,
}) => {
  const { lang, t, formatNumber } = useLanguage();
  if (!isOpen) return null;

  const [origin, setOrigin] = useState(POPULAR_LOCATIONS[0]);
  const [destination, setDestination] = useState(POPULAR_LOCATIONS[4]);
  const [isRoundTrip, setIsRoundTrip] = useState(true);

  const getDistanceEstimate = (start: string, end: string) => {
    let base = 25;
    if (end.includes('Nội Bài') || start.includes('Nội Bài')) base = 32;
    else if (end.includes('Bắc Ninh') || start.includes('Bắc Ninh')) base = 48;
    else if (end.includes('Hải Phòng') || start.includes('Hải Phòng')) base = 120;
    else if (end.includes('Bình Dương') || start.includes('Bình Dương')) base = 35;
    else if (end.includes('JW Marriott') || end.includes('Hội nghị Quốc gia')) base = 8;
    else if (end.includes('Văn phòng Chính phủ')) base = 12;

    return isRoundTrip ? base * 2 : base;
  };

  const distance = getDistanceEstimate(origin, destination);
  const durationMin = Math.round(distance * 2.2);
  const estimatedFuelLitres = (distance * 0.08).toFixed(1);
  const estimatedFuelCost = Math.round(Number(estimatedFuelLitres) * 23500);
  const estimatedToll = distance > 50 ? 70000 : distance > 25 ? 35000 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {lang === 'vi' ? 'Ước Tính Lộ Trình & Định Mức Chi Phí' : 'Route Estimator & Expense Calculation'}
              </h3>
              <p className="text-xs text-blue-100">
                {lang === 'vi' ? 'Tính toán cự ly, thời gian xe chạy và định mức xăng xe' : 'Calculate distance, travel time, and estimated fuel expense'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>{lang === 'vi' ? 'Điểm xuất phát:' : 'Departure location:'}</span>
              </label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              >
                {POPULAR_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lang === 'vi' ? 'Điểm đến:' : 'Destination:'}</span>
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              >
                {POPULAR_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="isRound"
                checked={isRoundTrip}
                onChange={(e) => setIsRoundTrip(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-sm border-slate-300"
              />
              <label htmlFor="isRound" className="text-xs font-medium text-slate-700">
                {lang === 'vi' ? 'Tính toán cự ly khứ hồi (Cả đi và về)' : 'Round-trip calculation (two-way)'}
              </label>
            </div>
          </div>

          {/* Result Card */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-blue-100">
              <span className="text-xs font-bold text-slate-700">
                {lang === 'vi' ? 'Cự ly ước tính:' : 'Estimated distance:'}
              </span>
              <span className="text-xl font-black text-blue-700 font-mono">
                {distance} <span className="text-sm">KM</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
                <Clock className="w-4 h-4 mx-auto mb-1 text-slate-500" />
                <span className="text-[10px] text-slate-400 block">{lang === 'vi' ? 'Thời gian' : 'Est. Time'}</span>
                <strong className="text-slate-800 font-mono">~{durationMin} {lang === 'vi' ? 'phút' : 'mins'}</strong>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
                <Fuel className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                <span className="text-[10px] text-slate-400 block">{lang === 'vi' ? 'Nhiên liệu' : 'Fuel'}</span>
                <strong className="text-slate-800 font-mono">~{estimatedFuelLitres} L</strong>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
                <DollarSign className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
                <span className="text-[10px] text-slate-400 block">{lang === 'vi' ? 'Dự trù chi phí' : 'Est. Expense'}</span>
                <strong className="text-slate-800 font-mono">
                  {formatNumber(estimatedFuelCost + estimatedToll)} đ
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100"
          >
            {t.close}
          </button>
          {onApplyRoute && (
            <button
              onClick={() => {
                onApplyRoute(origin, destination, distance);
                onClose();
              }}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs"
            >
              <span>{lang === 'vi' ? 'Áp Dụng Lộ Trình Này' : 'Apply This Route'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
