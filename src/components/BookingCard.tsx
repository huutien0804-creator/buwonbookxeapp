import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Navigation,
  User,
  Users,
  Car,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  AlertCircle,
  ChevronRight,
  Phone,
  Play,
  Check,
} from 'lucide-react';
import { Booking, Vehicle, Driver, UserRole, NumericRole, BookingStatus, ROLE_FROM_STRING } from '../types/fleet';
import { useLanguage } from '../i18n/LanguageContext';

interface BookingCardProps {
  booking: Booking;
  vehicle?: Vehicle;
  driver?: Driver;
  currentRole: NumericRole | UserRole;
  onApproveByManager: (bookingId: string) => void;
  onRejectByManager: (bookingId: string) => void;
  onOpenDispatch: (booking: Booking) => void;
  onStartTrip: (bookingId: string) => void;
  onOpenComplete: (booking: Booking) => void;
  onCancelBooking: (bookingId: string) => void;
  onSyncSingleToSheets?: (booking: Booking) => void;
  onViewDetails?: (booking: Booking) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  vehicle,
  driver,
  currentRole,
  onApproveByManager,
  onRejectByManager,
  onOpenDispatch,
  onStartTrip,
  onOpenComplete,
  onCancelBooking,
  onSyncSingleToSheets,
  onViewDetails,
}) => {
  const { lang, t, getBookingStatusLabel, getVehicleTypeLabel, formatNumber } = useLanguage();

  const numericRole: NumericRole =
    typeof currentRole === 'number'
      ? currentRole
      : (ROLE_FROM_STRING[currentRole as UserRole] || 1);

  const getStatusBadge = (status: BookingStatus) => {
    const label = getBookingStatusLabel(status);

    switch (status) {
      case 'pending_manager':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            {label}
          </span>
        );
      case 'pending_dispatch':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {label}
          </span>
        );
      case 'assigned':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Car className="w-3.5 h-3.5" />
            {label}
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            {label}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" />
            {label}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            {label}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {label}
          </span>
        );
    }
  };

  const getPriorityBadge = () => {
    if (booking.priority === 'vip') {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200">
          ★ VIP
        </span>
      );
    }
    if (booking.priority === 'urgent') {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200">
          {lang === 'vi' ? 'Khẩn Cấp' : 'Urgent'}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4">
      {/* Top bar: Code, Department, Status, Priority */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
              {booking.code}
            </span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
              {booking.department}
            </span>
            {getPriorityBadge()}
          </div>
          <div>{getStatusBadge(booking.status)}</div>
        </div>

        {/* Purpose */}
        <h4 className="text-sm font-bold text-slate-900 leading-snug mb-3">
          {booking.purpose}
        </h4>

        {/* Route Details */}
        <div className="bg-slate-50/70 rounded-2xl p-3 border border-slate-200/60 space-y-2 text-xs">
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {t.pickupPoint}
              </span>
              <span className="font-medium text-slate-800">{booking.pickupLocation}</span>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Navigation className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {t.destinationPoint}
              </span>
              <span className="font-medium text-slate-800">{booking.destination}</span>
            </div>
          </div>
        </div>

        {/* Time & Vehicle details */}
        <div className="grid grid-cols-2 gap-3 mt-3 text-xs text-slate-600">
          <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">{t.departureTime}:</span>
              <span className="font-semibold text-slate-800">
                {new Date(booking.departureTime).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl">
            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">{t.passengers}:</span>
              <span className="font-semibold text-slate-800">
                {booking.passengerCount} {lang === 'vi' ? 'người' : 'pax'} ({getVehicleTypeLabel(booking.vehicleTypeNeeded)})
              </span>
            </div>
          </div>
        </div>

        {/* Requester Info */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
          <div className="flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-700">{booking.requesterName}</span>
            <span>•</span>
            <span className="font-mono">{booking.requesterPhone}</span>
          </div>

          {booking.syncedToSheets ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              {t.syncedBadge}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
              {t.unSyncedBadge}
            </span>
          )}
        </div>

        {/* Dispatch Assignment Info if assigned */}
        {(vehicle || driver) && (
          <div className="mt-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3 text-xs">
            <div className="font-bold text-blue-900 mb-1 flex items-center justify-between">
              <span>{lang === 'vi' ? 'Đội xe & Tài xế phục vụ:' : 'Assigned Vehicle & Driver:'}</span>
              {vehicle?.plateNumber && (
                <span className="font-mono bg-blue-200/60 px-2 py-0.5 rounded text-blue-800">
                  {vehicle.plateNumber}
                </span>
              )}
            </div>
            <div className="text-slate-700 space-y-0.5">
              {vehicle && (
                <div>
                  {t.assignedVehicle}: <strong className="text-slate-900">{vehicle.model}</strong> ({vehicle.fuelType})
                </div>
              )}
              {driver && (
                <div>
                  {t.assignedDriver}: <strong className="text-slate-900">{driver.name}</strong> •{' '}
                  <a href={`tel:${driver.phone}`} className="text-blue-600 underline">
                    {driver.phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Trip Completion Summary if completed */}
        {booking.status === 'completed' && (
          <div className="mt-2 bg-emerald-50/60 border border-emerald-200 rounded-2xl p-2.5 text-xs text-emerald-900 flex justify-between items-center">
            <span>
              {lang === 'vi' ? 'KM Thực tế:' : 'Actual Distance:'}{' '}
              <strong>{booking.actualDistanceKm || booking.estimatedDistanceKm} km</strong>
            </span>
            {booking.tollFee ? (
              <span>
                {lang === 'vi' ? 'Phí cầu đường:' : 'Toll fees:'}{' '}
                <strong>{formatNumber(booking.tollFee)} đ</strong>
              </span>
            ) : null}
          </div>
        )}

        {/* Rejection notice if rejected */}
        {booking.status === 'rejected' && booking.rejectionReason && (
          <div className="mt-2 bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-800">
            {lang === 'vi' ? 'Lý do từ chối:' : 'Rejection reason:'} {booking.rejectionReason}
          </div>
        )}
      </div>

      {/* Action Buttons based on Role & Status */}
      <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-2">
        {/* Left tools: Details button & Quick Sync Button */}
        <div className="flex items-center space-x-1.5">
          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(booking)}
              className="px-2.5 py-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold"
              title={lang === 'vi' ? 'Xem chi tiết phiếu' : 'View booking details'}
            >
              <span>{lang === 'vi' ? 'Xem chi tiết' : 'Details'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {onSyncSingleToSheets && (
            <button
              type="button"
              onClick={() => onSyncSingleToSheets(booking)}
              title={t.btnSyncToSheet}
              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200 transition-colors flex items-center gap-1 text-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-semibold hidden sm:inline">{t.btnSyncToSheet}</span>
            </button>
          )}
        </div>

        {/* Contextual Role Actions */}
        <div className="flex items-center space-x-2 ml-auto">
          {/* Manager & Admin Actions (Duyệt / Từ Chối) */}
          {(numericRole === 0 || numericRole === 2 || numericRole === 3) &&
            booking.status === 'pending_manager' && (
              <>
                <button
                  onClick={() => onRejectByManager(booking.id)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{t.btnReject}</span>
                </button>
                <button
                  onClick={() => onApproveByManager(booking.id)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{t.btnApprove}</span>
                </button>
              </>
            )}

          {/* Dispatcher & Admin Actions (Xếp xe & Phân công) */}
          {(numericRole === 0 || numericRole === 3) &&
            (booking.status === 'pending_dispatch' || booking.status === 'assigned') && (
              <button
                onClick={() => onOpenDispatch(booking)}
                className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
              >
                <Car className="w-3.5 h-3.5" />
                <span>
                  {booking.status === 'assigned'
                    ? (lang === 'vi' ? 'Điều Chỉnh Xe/Tài Xế' : 'Reassign Vehicle/Driver')
                    : t.btnDispatch}
                </span>
              </button>
            )}

          {/* Driver Actions (Role 4, Dispatcher 3, Admin 0) */}
          {(numericRole === 0 || numericRole === 3 || numericRole === 4) && (
            <>
              {booking.status === 'assigned' && (
                <button
                  onClick={() => onStartTrip(booking.id)}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t.btnStartTrip}</span>
                </button>
              )}
              {booking.status === 'in_progress' && (
                <button
                  onClick={() => onOpenComplete(booking)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{t.btnCompleteTrip}</span>
                </button>
              )}
            </>
          )}

          {/* Employee & Admin Cancel option if pending */}
          {(numericRole === 0 || numericRole === 1) &&
            booking.status === 'pending_manager' && (
              <button
                onClick={() => onCancelBooking(booking.id)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
              >
                {t.btnCancelTrip}
              </button>
            )}
        </div>
      </div>
    </div>
  );
};
