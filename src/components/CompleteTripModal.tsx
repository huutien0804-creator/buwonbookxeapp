import React, { useState } from 'react';
import { X, CheckCircle, Gauge, DollarSign, FileText, Check } from 'lucide-react';
import { Booking, Vehicle } from '../types/fleet';
import { useLanguage } from '../i18n/LanguageContext';

interface CompleteTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  vehicle?: Vehicle;
  onConfirmComplete: (
    bookingId: string,
    actualKm: number,
    tollFee: number,
    fuelCost: number,
    driverNotes?: string
  ) => void;
}

export const CompleteTripModal: React.FC<CompleteTripModalProps> = ({
  isOpen,
  onClose,
  booking,
  vehicle,
  onConfirmComplete,
}) => {
  const { lang, t } = useLanguage();

  if (!isOpen || !booking) return null;

  const [actualKm, setActualKm] = useState(
    booking.actualDistanceKm || booking.estimatedDistanceKm || 20
  );
  const [tollFee, setTollFee] = useState(booking.tollFee || 0);
  const [fuelCost, setFuelCost] = useState(booking.fuelCost || 0);
  const [driverNotes, setDriverNotes] = useState(
    booking.driverNotes || (lang === 'vi' ? 'Chuyến đi an toàn, xe trả đúng giờ.' : 'Trip completed safely and on schedule.')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmComplete(
      booking.id,
      Number(actualKm),
      Number(tollFee),
      Number(fuelCost),
      driverNotes
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{t.modalCompleteTitle}</h3>
              <p className="text-xs text-emerald-100">
                #{booking.code} • {booking.requesterName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/80 text-xs text-slate-700">
            <div className="font-bold text-slate-800 mb-1">
              {vehicle?.model} ({vehicle?.plateNumber})
            </div>
            <div className="text-slate-600">
              {t.route}: {booking.pickupLocation} ➔ {booking.destination}
            </div>
            <div className="text-emerald-700 font-semibold mt-1">
              {lang === 'vi' ? 'Ước tính ban đầu:' : 'Initial estimate:'} {booking.estimatedDistanceKm} km
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {lang === 'vi' ? 'Số KM thực tế đã chạy:' : 'Actual Distance Traveled:'}
            </label>
            <div className="relative">
              <Gauge className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="number"
                min="1"
                step="0.5"
                required
                value={actualKm}
                onChange={(e) => setActualKm(Number(e.target.value))}
                className="w-full pl-9 pr-12 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-500 font-medium">
                KM
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {lang === 'vi' ? 'Phí cầu đường (BOT/Bến bãi):' : 'Toll / Parking fees:'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={tollFee}
                  onChange={(e) => setTollFee(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">VNĐ</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {lang === 'vi' ? 'Chi phí nhiên liệu (nếu có):' : 'Fuel expense (if any):'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={fuelCost}
                  onChange={(e) => setFuelCost(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">VNĐ</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {lang === 'vi' ? 'Nhật ký bàn giao & ghi chú tài xế:' : 'Driver trip handover notes:'}
            </label>
            <textarea
              rows={2}
              value={driverNotes}
              onChange={(e) => setDriverNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors shadow-2xs"
          >
            {t.close}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>{t.btnCompleteTrip}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
