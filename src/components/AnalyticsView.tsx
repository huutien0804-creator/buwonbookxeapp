import React from 'react';
import {
  TrendingUp,
  Car,
  Gauge,
  DollarSign,
  CheckCircle,
  FileSpreadsheet,
  Users,
  Compass,
  BarChart2,
} from 'lucide-react';
import { Booking, Vehicle, Driver } from '../types/fleet';
import { DEPARTMENTS } from '../data/mockData';
import { useLanguage } from '../i18n/LanguageContext';

interface AnalyticsViewProps {
  bookings: Booking[];
  vehicles: Vehicle[];
  drivers: Driver[];
  spreadsheetUrl?: string | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  bookings,
  vehicles,
  drivers,
  spreadsheetUrl,
}) => {
  const { lang, t, formatNumber } = useLanguage();
  const totalBookings = bookings.length;

  if (totalBookings === 0) {
    return (
      <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3">
        <BarChart2 className="w-12 h-12 text-slate-300 mx-auto" />
        <h4 className="text-base font-bold text-slate-700">
          {lang === 'vi' ? 'Chưa có dữ liệu thống kê' : 'No analytics data yet'}
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {lang === 'vi'
            ? 'Danh sách chuyến xe hiện đang trống. Khi có chuyến xe được tạo hoặc đồng bộ từ Google Sheets, biểu đồ phân tích và chi phí sẽ hiển thị tại đây.'
            : 'Trip bookings list is empty. Once bookings are created or loaded from Google Sheets, metrics and operational charts will appear here.'}
        </p>
      </div>
    );
  }

  const completedTrips = bookings.filter((b) => b.status === 'completed');
  const inProgressTrips = bookings.filter((b) => b.status === 'in_progress');
  const pendingTrips = bookings.filter(
    (b) => b.status === 'pending_manager' || b.status === 'pending_dispatch'
  );

  const totalKm = bookings.reduce((sum, b) => {
    return sum + (b.actualDistanceKm || b.estimatedDistanceKm || 0);
  }, 0);

  const totalTollFees = bookings.reduce((sum, b) => sum + (b.tollFee || 0), 0);
  const totalFuelCosts = bookings.reduce((sum, b) => sum + (b.fuelCost || 0), 0);
  const totalCost = totalTollFees + totalFuelCosts;

  // Department distribution
  const deptCounts = DEPARTMENTS.map((dept) => {
    const count = bookings.filter((b) => b.department === dept).length;
    const km = bookings
      .filter((b) => b.department === dept)
      .reduce((sum, b) => sum + (b.actualDistanceKm || b.estimatedDistanceKm || 0), 0);
    return { dept, count, km };
  }).sort((a, b) => b.count - a.count);

  // Vehicle utilization
  const vehicleStats = vehicles.map((v) => {
    const trips = bookings.filter((b) => b.assignedVehicleId === v.id);
    const completed = trips.filter((b) => b.status === 'completed').length;
    return {
      vehicle: v,
      tripCount: trips.length,
      completed,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.totalTrips}
            </span>
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">{totalBookings}</div>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="text-emerald-600 font-bold">
              {completedTrips.length} {lang === 'vi' ? 'hoàn thành' : 'completed'}
            </span>
            <span>•</span>
            <span className="text-amber-600 font-bold">
              {pendingTrips.length} {lang === 'vi' ? 'chờ duyệt' : 'pending'}
            </span>
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.totalDistance}
            </span>
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
              <Gauge className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">
            {formatNumber(totalKm)} <span className="text-sm font-semibold">KM</span>
          </div>
          <p className="text-xs text-slate-500">
            {lang === 'vi' ? 'Trung bình' : 'Avg.'} {Math.round(totalKm / totalBookings)} km / {lang === 'vi' ? 'chuyến' : 'trip'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {lang === 'vi' ? 'Chi Phí Vận Hành' : 'Operating Cost'}
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">
            {formatNumber(totalCost)} <span className="text-sm font-semibold">VNĐ</span>
          </div>
          <p className="text-xs text-slate-500">
            BOT: {formatNumber(totalTollFees)} đ • {lang === 'vi' ? 'Xăng/Điện:' : 'Fuel/EV:'} {formatNumber(totalFuelCosts)} đ
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.vehicleUtilization}
            </span>
            <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">
            {Math.round((completedTrips.length / totalBookings) * 100)}%
          </div>
          <p className="text-xs text-slate-500">
            {vehicles.filter((v) => v.status === 'available').length} {lang === 'vi' ? 'xe sẵn sàng' : 'available cars'} • {drivers.length} {lang === 'vi' ? 'tài xế' : 'drivers'}
          </p>
        </div>
      </div>

      {/* Breakdown Section: Departments & Vehicles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Usage */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            {t.tripsByDepartment}
          </h3>
          <div className="space-y-3.5">
            {deptCounts.map(({ dept, count, km }) => {
              const percent = Math.round((count / totalBookings) * 100);
              return (
                <div key={dept} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{dept}</span>
                    <span className="text-slate-500 font-mono">
                      {count} {lang === 'vi' ? 'chuyến' : 'trips'} ({percent}%) • {formatNumber(km)} km
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vehicle Activity List */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Car className="w-4 h-4 text-blue-600" />
            {lang === 'vi' ? 'Tần Suất Hoạt Động Theo Phương Tiện' : 'Activity Breakdown by Vehicle'}
          </h3>
          <div className="space-y-3">
            {vehicleStats.map(({ vehicle, tripCount, completed }) => (
              <div
                key={vehicle.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{vehicle.model}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {vehicle.plateNumber} • Odo: {formatNumber(vehicle.currentMileage)} km
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-700">
                    {tripCount} {lang === 'vi' ? 'lượt điều xe' : 'dispatches'}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium">
                    {completed} {lang === 'vi' ? 'chuyến hoàn tất' : 'completed trips'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
