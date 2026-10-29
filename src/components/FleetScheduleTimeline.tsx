import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Car,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ShieldAlert,
  Play,
  Check,
  User,
  MapPin,
  Navigation,
  Sparkles,
} from 'lucide-react';
import {
  Vehicle,
  Booking,
  NumericRole,
  UserRole,
  UserProfile,
  Driver,
  ROLE_FROM_STRING,
} from '../types/fleet';
import { useLanguage } from '../i18n/LanguageContext';

interface FleetScheduleTimelineProps {
  vehicles: Vehicle[];
  bookings: Booking[];
  currentRole?: NumericRole | UserRole;
  currentUser?: UserProfile;
  drivers?: Driver[];
  onSelectBooking?: (booking: Booking) => void;
  onNavigateToFleet?: () => void;
  onStartTrip?: (bookingId: string) => void;
  onOpenComplete?: (booking: Booking) => void;
}

export const FleetScheduleTimeline: React.FC<FleetScheduleTimelineProps> = ({
  vehicles,
  bookings,
  currentRole = 1,
  currentUser,
  drivers = [],
  onSelectBooking,
  onNavigateToFleet,
  onStartTrip,
  onOpenComplete,
}) => {
  const { lang, t, getRoleLabel } = useLanguage();
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);

  const numericRole: NumericRole =
    typeof currentRole === 'number'
      ? currentRole
      : (ROLE_FROM_STRING[currentRole as UserRole] || 1);

  const isDriver = numericRole === 4;

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + selectedDayOffset);
  const targetDateStr = targetDate.toISOString().split('T')[0];

  // Check if booking belongs to current driver
  const isDriverAssigned = (b: Booking) => {
    if (!currentUser) return true;
    if (currentUser.driverId && b.assignedDriverId === currentUser.driverId) return true;
    const assignedDrv = drivers.find((d) => d.id === b.assignedDriverId);
    if (assignedDrv && assignedDrv.name.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) {
      return true;
    }
    if (b.notes?.toLowerCase().includes(currentUser.name.toLowerCase())) {
      return true;
    }
    return false;
  };

  // Trips assigned to driver across all time
  const driverMyTrips = bookings.filter((b) => isDriverAssigned(b));

  // Helper to test if a vehicle has an active booking during target date
  const getVehicleBookingsForDay = (vehicleId: string) => {
    return bookings.filter((b) => {
      if (b.assignedVehicleId !== vehicleId) return false;
      if (b.status === 'rejected' || b.status === 'cancelled') return false;
      if (isDriver && !isDriverAssigned(b)) return false; // Driver only sees their own assigned trips
      return b.departureTime.startsWith(targetDateStr);
    });
  };

  // Vehicles relevant to this driver (if driver, only show vehicles they are assigned to, or all if none)
  const relevantVehicles = isDriver
    ? vehicles.filter((v) => {
        const hasDriverBookings = bookings.some(
          (b) => b.assignedVehicleId === v.id && isDriverAssigned(b)
        );
        return hasDriverBookings || v.defaultDriverId === currentUser?.driverId;
      })
    : vehicles;

  const displayVehicles = relevantVehicles.length > 0 ? relevantVehicles : vehicles;

  const dayLabel =
    selectedDayOffset === 0
      ? t.timelineToday
      : selectedDayOffset === 1
      ? (lang === 'vi' ? 'Ngày Mai' : 'Tomorrow')
      : (lang === 'vi' ? `+${selectedDayOffset} ngày` : `+${selectedDayOffset} days`);

  return (
    <div className="space-y-6">
      {/* Driver Persona Header & Quick Action Card (for Role 4) */}
      {isDriver && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-3xl p-6 text-white shadow-md border border-blue-800">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">
                🚗
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                    {lang === 'vi' ? 'Tài Xế Trực Lệnh' : 'On-Duty Driver'}
                  </span>
                  <span className="text-slate-300 text-xs">
                    {currentUser?.name || 'Tài xế'} • {currentUser?.phone}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight mt-1">
                  {lang === 'vi'
                    ? 'Lịch Trình Chuyến Đi Được Chỉ Định Lái'
                    : 'Your Assigned Driving Schedule'}
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-blue-200 block">
                {lang === 'vi' ? 'Tổng chuyến được giao:' : 'Assigned trips:'}
              </span>
              <span className="text-2xl font-black text-white">
                {driverMyTrips.length} {lang === 'vi' ? 'chuyến' : 'trips'}
              </span>
            </div>
          </div>

          {/* Assigned Trips Cards for Driver */}
          {driverMyTrips.length === 0 ? (
            <div className="bg-white/10 rounded-2xl p-5 text-center text-xs text-blue-100 border border-white/10">
              <p className="font-semibold text-sm">
                {lang === 'vi'
                  ? 'Hiện tại bạn chưa có chuyến đi nào được chỉ định lái.'
                  : 'You have no assigned trips at the moment.'}
              </p>
              <p className="text-[11px] text-blue-200/80 mt-1">
                {lang === 'vi'
                  ? 'Khi Điều Phối Xe phân công phương tiện và tài xế, chuyến đi sẽ xuất hiện ngay tại đây.'
                  : 'When the fleet dispatcher assigns you to a booking, it will appear here.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {driverMyTrips.map((b) => {
                const isAssigned = b.status === 'assigned';
                const isInProgress = b.status === 'in_progress';
                const isCompleted = b.status === 'completed';

                return (
                  <div
                    key={b.id}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black bg-white/20 px-2 py-0.5 rounded">
                        #{b.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isAssigned
                            ? 'bg-amber-400/20 text-amber-200 border border-amber-400/30'
                            : isInProgress
                            ? 'bg-blue-400/30 text-blue-200 border border-blue-400/40 animate-pulse'
                            : 'bg-emerald-400/20 text-emerald-200'
                        }`}
                      >
                        {isAssigned
                          ? (lang === 'vi' ? 'Đã xếp xe - Sẵn sàng chạy' : 'Assigned - Ready')
                          : isInProgress
                          ? (lang === 'vi' ? 'Đang thực hiện chuyến' : 'In Progress')
                          : (lang === 'vi' ? 'Đã hoàn thành' : 'Completed')}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-white">{b.purpose}</h4>
                      <p className="text-xs text-blue-200">
                        {lang === 'vi' ? 'Khách đặt:' : 'Requester:'} {b.requesterName} ({b.department}) •{' '}
                        {b.requesterPhone}
                      </p>
                    </div>

                    <div className="text-xs space-y-1 text-slate-200 bg-black/20 p-2.5 rounded-xl">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="truncate">{b.pickupLocation}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{b.destination}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-blue-200 pt-1 border-t border-white/10">
                        <Clock className="w-3 h-3 text-blue-300" />
                        <span>
                          {new Date(b.departureTime).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')}
                        </span>
                      </div>
                    </div>

                    {/* Driver Quick Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => onSelectBooking?.(b)}
                        className="text-xs text-blue-200 hover:text-white underline font-semibold"
                      >
                        {lang === 'vi' ? 'Xem chi tiết' : 'Details'}
                      </button>

                      <div className="flex items-center space-x-2">
                        {isAssigned && onStartTrip && (
                          <button
                            onClick={() => onStartTrip(b.id)}
                            className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>{lang === 'vi' ? 'Bắt Đầu Chuyến' : 'Start Trip'}</span>
                          </button>
                        )}

                        {isInProgress && onOpenComplete && (
                          <button
                            onClick={() => onOpenComplete(b)}
                            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>{lang === 'vi' ? 'Hoàn Thành & Chốt ODO' : 'Complete Trip'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Main Timeline Board */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header bar */}
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>{t.timelineTitle}</span>
              {isDriver && (
                <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                  {lang === 'vi' ? 'Lịch xe được phân công' : 'Assigned Fleet Schedule'}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              {isDriver
                ? (lang === 'vi'
                    ? 'Chỉ hiển thị lịch trình các chuyến đi mà bạn được chỉ định lái'
                    : 'Showing only driving trips assigned to you')
                : t.timelineSubtitle}
            </p>
          </div>

          {/* Date Selector */}
          <div className="flex items-center space-x-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setSelectedDayOffset((prev) => Math.max(0, prev - 1))}
              disabled={selectedDayOffset === 0}
              className="p-1.5 rounded-xl hover:bg-slate-100 disabled:opacity-30 text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-slate-800 px-3 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              {dayLabel}{' '}
              ({targetDate.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
                day: '2-digit',
                month: '2-digit',
              })})
            </span>

            <button
              onClick={() => setSelectedDayOffset((prev) => prev + 1)}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Empty State when no vehicles in fleet */}
        {vehicles.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Car className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-700">
              {t.noVehiclesTitle}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {t.noVehiclesDesc}
            </p>
            {onNavigateToFleet && (
              <button
                onClick={onNavigateToFleet}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 hover:bg-blue-700"
              >
                <Car className="w-4 h-4" />
                <span>{t.navFleet}</span>
              </button>
            )}
          </div>
        ) : (
          /* Timeline Grid */
          <div className="overflow-x-auto p-4">
            <div className="min-w-[760px]">
              {/* Header Time Columns */}
              <div className="grid grid-cols-12 gap-1 mb-3 text-[11px] font-bold text-slate-400">
                <div className="col-span-3 px-2">{t.timelineVehicleColumn}</div>
                <div className="col-span-9 grid grid-cols-7 gap-1 text-center font-mono">
                  <span>07:00 - 09:00</span>
                  <span>09:00 - 11:00</span>
                  <span>11:00 - 13:00</span>
                  <span>13:00 - 15:00</span>
                  <span>15:00 - 17:00</span>
                  <span>17:00 - 19:00</span>
                  <span>19:00 - 21:00</span>
                </div>
              </div>

              {/* Vehicle Rows */}
              <div className="space-y-2.5">
                {displayVehicles.map((veh) => {
                  const dayBookings = getVehicleBookingsForDay(veh.id);
                  const isMaintenance = veh.status === 'maintenance';

                  return (
                    <div
                      key={veh.id}
                      className="grid grid-cols-12 gap-1 items-center bg-slate-50/80 hover:bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60 transition-colors"
                    >
                      {/* Vehicle Info */}
                      <div className="col-span-3 pr-2">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`p-1.5 rounded-xl shrink-0 ${
                              isMaintenance
                                ? 'bg-rose-100 text-rose-600'
                                : veh.status === 'in_use'
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-emerald-100 text-emerald-600'
                            }`}
                          >
                            <Car className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate">
                              {veh.model}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {veh.plateNumber} • {veh.seats} {lang === 'vi' ? 'chỗ' : 'seats'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 7 Time Blocks */}
                      <div className="col-span-9 grid grid-cols-7 gap-1 h-12">
                        {isMaintenance ? (
                          <div className="col-span-7 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-center text-xs font-medium text-rose-700">
                            {lang === 'vi'
                              ? 'Đang bảo dưỡng định kỳ tại xưởng'
                              : 'Scheduled maintenance at service workshop'}
                          </div>
                        ) : dayBookings.length === 0 ? (
                          <div className="col-span-7 bg-emerald-50/50 border border-dashed border-emerald-200 rounded-xl flex items-center justify-center text-[11px] font-medium text-emerald-700">
                            ✓{' '}
                            {isDriver
                              ? (lang === 'vi'
                                  ? 'Không có lịch trình lái xe này trong ngày'
                                  : 'No assigned trips for this vehicle today')
                              : (lang === 'vi'
                                  ? 'Cả ngày sẵn sàng nhận lệnh điều xe'
                                  : 'Available all day for assignment')}
                          </div>
                        ) : (
                          dayBookings.map((b) => (
                            <div
                              key={b.id}
                              onClick={() => onSelectBooking?.(b)}
                              className="col-span-7 bg-blue-600 text-white rounded-xl p-2 cursor-pointer shadow-xs hover:bg-blue-700 transition-all flex items-center justify-between"
                            >
                              <div className="min-w-0">
                                <span className="text-[11px] font-bold block truncate">
                                  #{b.code} • {b.requesterName} ({b.department})
                                </span>
                                <span className="text-[10px] text-blue-100 truncate block">
                                  {b.pickupLocation.split(':')[0]} ➔ {b.destination.split(':')[0]}
                                </span>
                              </div>
                              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-mono shrink-0">
                                {new Date(b.departureTime).toLocaleTimeString(
                                  lang === 'vi' ? 'vi-VN' : 'en-US',
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )}{' '}
                                -{' '}
                                {b.returnTime
                                  ? new Date(b.returnTime).toLocaleTimeString(
                                      lang === 'vi' ? 'vi-VN' : 'en-US',
                                      {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      }
                                    )
                                  : (lang === 'vi' ? 'Một chiều' : 'One-way')}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
