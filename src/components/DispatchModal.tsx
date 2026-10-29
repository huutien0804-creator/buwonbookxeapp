import React, { useState } from 'react';
import { X, Car, UserCheck, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Booking, Vehicle, Driver } from '../types/fleet';
import { useLanguage } from '../i18n/LanguageContext';

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  vehicles: Vehicle[];
  drivers: Driver[];
  onConfirmDispatch: (
    bookingId: string,
    vehicleId: string,
    driverId: string,
    notes?: string
  ) => void;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  isOpen,
  onClose,
  booking,
  vehicles,
  drivers,
  onConfirmDispatch,
}) => {
  const { lang, t, getVehicleStatusLabel, formatNumber } = useLanguage();

  if (!isOpen || !booking) return null;

  // Filter vehicles by compatible type or available status first
  const [selectedVehicleId, setSelectedVehicleId] = useState(
    booking.assignedVehicleId ||
      vehicles.find((v) => v.status === 'available' && v.type === booking.vehicleTypeNeeded)?.id ||
      vehicles.find((v) => v.status === 'available')?.id ||
      vehicles[0]?.id ||
      ''
  );

  const [selectedDriverId, setSelectedDriverId] = useState(
    booking.assignedDriverId ||
      drivers.find((d) => d.status === 'active')?.id ||
      drivers[0]?.id ||
      ''
  );

  const [dispatchNotes, setDispatchNotes] = useState('');

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const selectedDriver = drivers.find((d) => d.id === selectedDriverId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId || !selectedDriverId) {
      alert(lang === 'vi' ? 'Vui lòng chọn cả phương tiện và tài xế điều phối!' : 'Please select both vehicle and driver!');
      return;
    }
    onConfirmDispatch(booking.id, selectedVehicleId, selectedDriverId, dispatchNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-amber-600 to-orange-700 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{t.modalDispatchTitle}</h3>
              <p className="text-xs text-amber-100">
                #{booking.code} • {booking.requesterName} ({booking.department})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-amber-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Booking Summary */}
          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/70 text-xs text-slate-700 space-y-2">
            <div className="flex justify-between items-center font-bold text-slate-800">
              <span>{t.purpose}: {booking.purpose}</span>
              <span className="text-amber-700">
                {t.passengers}: {booking.passengerCount} {lang === 'vi' ? 'người' : 'pax'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div>
                <strong>{t.pickupPoint}:</strong> {booking.pickupLocation}
              </div>
              <div>
                <strong>{t.destinationPoint}:</strong> {booking.destination}
              </div>
              <div>
                <strong>{t.departureTime}:</strong> {new Date(booking.departureTime).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')}
              </div>
              <div>
                <strong>{t.returnTime}:</strong>{' '}
                {booking.returnTime
                  ? new Date(booking.returnTime).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')
                  : (lang === 'vi' ? 'Một chiều' : 'One-way')}
              </div>
            </div>
          </div>

          {/* Chọn Phương Tiện */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
              {lang === 'vi' ? `1. Chọn Phương Tiện Phục Vụ (${vehicles.length} xe trong đội)` : `1. Assign Vehicle (${vehicles.length} vehicles)`}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1">
              {vehicles.map((v) => {
                const isSelected = selectedVehicleId === v.id;
                const isAvailable = v.status === 'available';
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                      <Car className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 truncate">{v.model}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isAvailable
                              ? 'bg-emerald-100 text-emerald-800'
                              : v.status === 'in_use'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {getVehicleStatusLabel(v.status)}
                        </span>
                      </div>
                      <div className="text-slate-500 font-mono mt-0.5">{v.plateNumber}</div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                        <span>{v.seats} {lang === 'vi' ? 'chỗ' : 'seats'} • {v.fuelType}</span>
                        <span>{formatNumber(v.currentMileage)} km</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chọn Tài Xế */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
              {lang === 'vi' ? `2. Chỉ Định Tài Xế Phụ Trách (${drivers.length} tài xế)` : `2. Assign Driver (${drivers.length} drivers)`}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1">
              {drivers.map((d) => {
                const isSelected = selectedDriverId === d.id;
                const isActive = d.status === 'active';
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDriverId(d.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 font-bold flex items-center justify-center shrink-0 text-xs">
                      {d.name.split(' ').slice(-1)[0][0]}
                    </div>
                    <div className="min-w-0 flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{d.name}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : d.status === 'busy'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isActive ? t.driverStatusActive : d.status === 'busy' ? t.driverStatusBusy : t.driverStatusOff}
                        </span>
                      </div>
                      <div className="text-slate-600 mt-0.5">{d.phone}</div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                        <span>{lang === 'vi' ? 'Hạng' : 'Class'} {d.licenseClass} • {d.experienceYears} {t.years}</span>
                        <span className="text-amber-600 font-bold">★ {d.rating}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ghi chú điều phối */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {lang === 'vi' ? 'Ghi chú lệnh điều xe (gửi tài xế):' : 'Dispatch notes for driver:'}
            </label>
            <input
              type="text"
              placeholder={lang === 'vi' ? 'VD: Kiểm tra áp suất lốp trước khi xuất phát, đón khách tại sảnh A...' : 'e.g. Check tire pressure, pickup at lobby A...'}
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
            {t.cancel}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{lang === 'vi' ? 'Phê Chuẩn & Điều Phối Xe' : 'Confirm Dispatch Assignment'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
