import React, { useState } from 'react';
import {
  X,
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
  Phone,
  Mail,
  Building,
  FileText,
  Play,
  Check,
  Shield,
  Send,
} from 'lucide-react';
import {
  Booking,
  Vehicle,
  Driver,
  NumericRole,
  UserRole,
  ROLE_MAP,
} from '../types/fleet';
import { useLanguage } from '../i18n/LanguageContext';

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  vehicle?: Vehicle;
  driver?: Driver;
  currentRole: NumericRole;
  onApproveByManager: (bookingId: string) => void;
  onRejectByManager: (bookingId: string) => void;
  onOpenDispatch: (booking: Booking) => void;
  onStartTrip: (bookingId: string) => void;
  onOpenComplete: (booking: Booking) => void;
  onCancelBooking: (bookingId: string) => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  isOpen,
  onClose,
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
}) => {
  const { lang, t, getBookingStatusLabel, getVehicleTypeLabel, formatNumber } =
    useLanguage();

  const [isRejecting, setIsRejecting] = useState(false);

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-black tracking-wider bg-white/20 px-2 py-0.5 rounded-lg">
                  {booking.code}
                </span>
                <span className="text-xs font-semibold text-blue-200">
                  {booking.department}
                </span>
              </div>
              <h3 className="text-lg font-black tracking-tight mt-0.5">
                {lang === 'vi' ? 'Chi Tiết Phiếu Đặt Xe' : 'Booking Request Details'}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              setIsRejecting(false);
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-2xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Status & Priority Overview */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                {lang === 'vi' ? 'Trạng thái hiện tại' : 'Current Status'}
              </span>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-slate-800">
                  {getBookingStatusLabel(booking.status)}
                </span>
                {booking.priority === 'vip' && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-purple-100 text-purple-700 border border-purple-200">
                    ★ VIP
                  </span>
                )}
                {booking.priority === 'urgent' && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-rose-100 text-rose-700 border border-rose-200">
                    {lang === 'vi' ? 'Khẩn Cấp' : 'Urgent'}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                {lang === 'vi' ? 'Thời gian tạo' : 'Created At'}
              </span>
              <span className="font-mono text-slate-600">
                {new Date(booking.createdAt).toLocaleString(
                  lang === 'vi' ? 'vi-VN' : 'en-US'
                )}
              </span>
            </div>
          </div>

          {/* Section 1: Requester Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600" />
              <span>{lang === 'vi' ? 'Thông Tin Người Đặt' : 'Requester Information'}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60">
              <div className="flex items-center space-x-2.5">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">{t.requester}</span>
                  <span className="font-bold text-slate-800">{booking.requesterName}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2.5">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">{t.department}</span>
                  <span className="font-semibold text-slate-800">{booking.department}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">{t.phone}</span>
                  <a href={`tel:${booking.requesterPhone}`} className="font-mono font-semibold text-blue-600 hover:underline">
                    {booking.requesterPhone || 'N/A'}
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Email</span>
                  <span className="font-mono text-slate-700 truncate block">
                    {booking.requesterEmail || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Itinerary & Purpose */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'vi' ? 'Hành Trình & Mục Đích Chuyến Đi' : 'Itinerary & Purpose'}</span>
            </h4>
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60 space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {t.purpose}
                </span>
                <p className="font-semibold text-slate-900 mt-0.5 text-sm">{booking.purpose}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                <div className="space-y-1">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        {t.pickupPoint}
                      </span>
                      <span className="font-medium text-slate-800">{booking.pickupLocation}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-start space-x-2">
                    <Navigation className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        {t.destinationPoint}
                      </span>
                      <span className="font-medium text-slate-800">{booking.destination}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 block">{t.departureTime}:</span>
                  <span className="font-bold text-slate-800">
                    {new Date(booking.departureTime).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">{t.returnTime}:</span>
                  <span className="font-bold text-slate-800">
                    {booking.returnTime
                      ? new Date(booking.returnTime).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')
                      : (lang === 'vi' ? 'Đi một chiều' : 'One-way')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">{lang === 'vi' ? 'Ước tính cự ly' : 'Estimated Dist.'}:</span>
                  <span className="font-bold text-slate-800">
                    ~{booking.estimatedDistanceKm} km ({booking.estimatedDurationMin} {lang === 'vi' ? 'phút' : 'min'})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Passenger & Vehicle Requirement */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>{lang === 'vi' ? 'Hành Khách & Loại Xe Yêu Cầu' : 'Passengers & Vehicle Needed'}</span>
            </h4>
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">{lang === 'vi' ? 'Loại xe yêu cầu' : 'Vehicle Type Needed'}:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {getVehicleTypeLabel(booking.vehicleTypeNeeded)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">{t.passengers}:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {booking.passengerCount} {lang === 'vi' ? 'người' : 'pax'}
                  </span>
                </div>
              </div>

              {booking.passengerList && booking.passengerList.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block mb-1">
                    {lang === 'vi' ? 'Danh sách hành khách đi cùng:' : 'Accompanying passenger list:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {booking.passengerList.map((p, idx) => (
                      <span key={idx} className="bg-white px-2 py-0.5 rounded-lg border border-slate-200 font-medium text-slate-700">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {booking.notes && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block">{t.notes}:</span>
                  <p className="text-slate-700 italic">{booking.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Dispatch & Execution status if assigned */}
          {(vehicle || driver || booking.assignedVehicleId) && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-4 h-4 text-orange-600" />
                <span>{lang === 'vi' ? 'Phương Tiện & Tài Xế Được Phân Công' : 'Assigned Fleet & Driver'}</span>
              </h4>
              <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200/80 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-blue-600 font-bold block">{t.assignedVehicle}:</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {vehicle?.model || (lang === 'vi' ? 'Xe công ty' : 'Company Fleet')}
                    </span>
                    {vehicle?.plateNumber && (
                      <span className="font-mono bg-blue-200/70 px-2 py-0.5 rounded ml-2 text-xs font-bold text-blue-900">
                        {vehicle.plateNumber}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-600 font-bold block">{t.assignedDriver}:</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {driver?.name || (lang === 'vi' ? 'Tài xế công ty' : 'Assigned Driver')}
                    </span>
                    {driver?.phone && (
                      <span className="font-mono text-slate-600 ml-2">
                        • {driver.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rejection Details if rejected */}
          {booking.status === 'rejected' && booking.rejectionReason && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800">
              <span className="text-[10px] font-bold uppercase tracking-wider block text-rose-600 mb-1">
                {lang === 'vi' ? 'Lý do từ chối' : 'Rejection Reason'}
              </span>
              <p className="font-medium">{booking.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Modal Action Footer based on RBAC */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              setIsRejecting(false);
              onClose();
            }}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            {t.close}
          </button>

          {/* Manager (Role 2) & Admin (Role 0) Approval / Rejection Actions */}
          {(currentRole === 0 || currentRole === 2 || currentRole === 3) && booking.status === 'pending_manager' && (
            <div className="flex items-center space-x-2 ml-auto">
              <button
                onClick={() => {
                  onRejectByManager(booking.id);
                  onClose();
                }}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>{lang === 'vi' ? 'Từ Chối Yêu Cầu' : 'Reject Request'}</span>
              </button>
              <button
                onClick={() => {
                  onApproveByManager(booking.id);
                  onClose();
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{lang === 'vi' ? '✓ Phê Duyệt Phiếu' : '✓ Approve Request'}</span>
              </button>
            </div>
          )}

          {/* Dispatcher (Role 3) & Admin (Role 0) Assignment Action */}
          {(currentRole === 0 || currentRole === 3) &&
            (booking.status === 'pending_dispatch' || booking.status === 'assigned') && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDispatch(booking);
                }}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ml-auto"
              >
                <Car className="w-4 h-4" />
                <span>
                  {booking.status === 'assigned'
                    ? (lang === 'vi' ? 'Điều Chỉnh Xe / Tài Xế' : 'Reassign Dispatch')
                    : (lang === 'vi' ? 'Xếp Xe & Phân Công Tài Xế' : 'Dispatch Vehicle & Driver')}
                </span>
              </button>
            )}

          {/* Driver Execution Actions (Role 4, Dispatcher 3, Admin 0) */}
          {(currentRole === 0 || currentRole === 3 || currentRole === 4) && booking.status === 'assigned' && (
            <button
              onClick={() => {
                onStartTrip(booking.id);
                onClose();
              }}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ml-auto"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t.btnStartTrip}</span>
            </button>
          )}

          {(currentRole === 0 || currentRole === 3 || currentRole === 4) && booking.status === 'in_progress' && (
            <button
              onClick={() => {
                onClose();
                onOpenComplete(booking);
              }}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ml-auto"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{t.btnCompleteTrip}</span>
            </button>
          )}

          {/* Employee & Admin Cancellation */}
          {(currentRole === 0 || currentRole === 1) && booking.status === 'pending_manager' && (
            <button
              onClick={() => {
                onCancelBooking(booking.id);
                onClose();
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 rounded-xl text-xs font-bold transition-colors ml-auto"
            >
              {t.btnCancelTrip}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
