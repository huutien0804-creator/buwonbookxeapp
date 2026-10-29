import React, { useState, useMemo } from 'react';
import {
  Car,
  User,
  Plus,
  Fuel,
  Gauge,
  Phone,
  Star,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Table as TableIcon,
  LayoutGrid,
  Search,
  Zap,
} from 'lucide-react';
import { Vehicle, Driver, VehicleType, VehicleStatus } from '../types/fleet';
import { useLanguage } from '../i18n/LanguageContext';

interface FleetListProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  onAddVehicle: (newVeh: Vehicle) => void;
  onUpdateVehicleStatus: (vehicleId: string, status: VehicleStatus) => void;
  onAddDriver: (newDrv: Driver) => void;
  onRefreshFromSheets?: () => void;
  isRefreshing?: boolean;
  lastSyncTime?: string | null;
  hasConnectedSheets?: boolean;
}

export const FleetList: React.FC<FleetListProps> = ({
  vehicles,
  drivers,
  onAddVehicle,
  onUpdateVehicleStatus,
  onAddDriver,
  onRefreshFromSheets,
  isRefreshing = false,
  lastSyncTime,
  hasConnectedSheets = false,
}) => {
  const { lang, t, getVehicleStatusLabel, getVehicleTypeLabel, formatNumber } = useLanguage();

  const [activeTab, setActiveTab] = useState<'vehicles' | 'drivers'>('vehicles');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);

  // Search & Filters for vehicles
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [fuelFilter, setFuelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // New vehicle form state
  const [newCode, setNewCode] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newType, setNewType] = useState<VehicleType>('suv_7');
  const [newSeats, setNewSeats] = useState(7);
  const [newFuel, setNewFuel] = useState<'Xăng' | 'Dầu' | 'Điện'>('Điện');
  const [newMileage, setNewMileage] = useState(0);
  const [newColor, setNewColor] = useState('Trắng');

  // New driver form state
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newDriverLicense, setNewDriverLicense] = useState('');
  const [newDriverClass, setNewDriverClass] = useState<'B2' | 'C' | 'D' | 'E'>('D');
  const [newDriverExp, setNewDriverExp] = useState(3);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const codeMatch = (v.code || '').toLowerCase().includes(query);
        const plateMatch = (v.plateNumber || '').toLowerCase().includes(query);
        const modelMatch = (v.model || '').toLowerCase().includes(query);
        if (!codeMatch && !plateMatch && !modelMatch) return false;
      }

      if (typeFilter !== 'all' && v.type !== typeFilter) {
        return false;
      }

      if (fuelFilter !== 'all' && v.fuelType !== fuelFilter) {
        return false;
      }

      if (statusFilter !== 'all' && v.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [vehicles, searchTerm, typeFilter, fuelFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = vehicles.length;
    const available = vehicles.filter((v) => v.status === 'available').length;
    const inUse = vehicles.filter((v) => v.status === 'in_use').length;
    const maintenance = vehicles.filter((v) => v.status === 'maintenance').length;
    return { total, available, inUse, maintenance };
  }, [vehicles]);

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate || !newModel) return;

    const code = newCode.trim() || `XE-${String(vehicles.length + 1).padStart(2, '0')}`;
    onAddVehicle({
      id: `veh_${code.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}`,
      code,
      plateNumber: newPlate.trim(),
      model: newModel.trim(),
      type: newType,
      seats: Number(newSeats),
      fuelType: newFuel,
      currentMileage: Number(newMileage),
      status: 'available',
      color: newColor,
      fuelEconomy: newFuel === 'Điện' ? '18 kWh / 100km' : newFuel === 'Dầu' ? '9.0 L / 100km' : '8.0 L / 100km',
      year: new Date().getFullYear(),
    });

    setIsAddVehicleOpen(false);
    setNewCode('');
    setNewPlate('');
    setNewModel('');
  };

  const handleCreateDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName || !newDriverPhone) return;

    onAddDriver({
      id: `drv_${Date.now()}`,
      name: newDriverName.trim(),
      phone: newDriverPhone.trim(),
      licenseNumber: newDriverLicense.trim() || '010199999999',
      licenseClass: newDriverClass,
      experienceYears: Number(newDriverExp),
      rating: 5.0,
      status: 'active',
    });

    setIsAddDriverOpen(false);
    setNewDriverName('');
    setNewDriverPhone('');
    setNewDriverLicense('');
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Tab switchers */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-2xs">
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'vehicles'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>{t.fleetTabVehicles} ({vehicles.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'drivers'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t.fleetTabDrivers} ({drivers.length})</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          {onRefreshFromSheets && (
            <button
              onClick={onRefreshFromSheets}
              disabled={isRefreshing}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold transition-all shadow-2xs disabled:opacity-50"
              title={t.refreshFromSheets}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? t.readingSheets : t.refreshFromSheets}</span>
            </button>
          )}

          {activeTab === 'vehicles' ? (
            <button
              onClick={() => setIsAddVehicleOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addVehicle}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAddDriverOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addDriver}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Đội Xe Công Ty */}
      {activeTab === 'vehicles' && (
        <div className="space-y-4">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t.kpiTotalFleet}</p>
                <p className="text-xl font-black text-slate-800 mt-0.5">{stats.total} <span className="text-xs font-normal text-slate-500">{t.kpiVehiclesUnit}</span></p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                <Car className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-emerald-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">{t.kpiAvailable}</p>
                <p className="text-xl font-black text-emerald-700 mt-0.5">{stats.available} <span className="text-xs font-normal text-emerald-600">{t.kpiVehiclesUnit}</span></p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-blue-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">{t.kpiInUse}</p>
                <p className="text-xl font-black text-blue-700 mt-0.5">{stats.inUse} <span className="text-xs font-normal text-blue-600">{t.kpiVehiclesUnit}</span></p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Gauge className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-rose-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">{t.kpiMaintenance}</p>
                <p className="text-xl font-black text-rose-700 mt-0.5">{stats.maintenance} <span className="text-xs font-normal text-rose-600">{t.kpiVehiclesUnit}</span></p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Wrench className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filter Bar & View Toggle */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={lang === 'vi' ? 'Tìm mã xe, biển số, dòng xe...' : 'Search code, plate, model...'}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Phân Loại Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:bg-white focus:outline-none"
              >
                <option value="all">{t.allVehicleTypes}</option>
                <option value="sedan_4">{getVehicleTypeLabel('sedan_4')}</option>
                <option value="suv_7">{getVehicleTypeLabel('suv_7')}</option>
                <option value="van_16">{getVehicleTypeLabel('van_16')}</option>
                <option value="pickup">{getVehicleTypeLabel('pickup')}</option>
              </select>

              {/* Nhiên Liệu Filter */}
              <select
                value={fuelFilter}
                onChange={(e) => setFuelFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:bg-white focus:outline-none"
              >
                <option value="all">{t.allFuelTypes}</option>
                <option value="Điện">{t.fuelType.electric}</option>
                <option value="Xăng">{t.fuelType.gasoline}</option>
                <option value="Dầu">{t.fuelType.diesel}</option>
              </select>

              {/* Trạng Thái Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:bg-white focus:outline-none"
              >
                <option value="all">{t.allStatuses}</option>
                <option value="available">{getVehicleStatusLabel('available')}</option>
                <option value="in_use">{getVehicleStatusLabel('in_use')}</option>
                <option value="maintenance">{getVehicleStatusLabel('maintenance')}</option>
              </select>

              {/* View Mode Toggle: Table vs Grid */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 ml-1">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'table'
                      ? 'bg-white text-blue-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                  title={t.viewTable}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>{t.viewTable}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-blue-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                  title={t.viewGrid}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>{t.viewGrid}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {filteredVehicles.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4">
              <Car className="w-12 h-12 text-slate-300 mx-auto" />
              <div>
                <h4 className="text-base font-bold text-slate-800">
                  {vehicles.length === 0 ? t.noVehiclesTitle : (lang === 'vi' ? 'Không tìm thấy xe phù hợp' : 'No matching vehicles found')}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  {vehicles.length === 0 ? t.noVehiclesDesc : (lang === 'vi' ? 'Thử tìm từ khóa khác hoặc xóa bộ lọc.' : 'Try different keywords or clear filters.')}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                {onRefreshFromSheets && (
                  <button
                    onClick={onRefreshFromSheets}
                    disabled={isRefreshing}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>{t.refreshFromSheets}</span>
                  </button>
                )}
                {vehicles.length > 0 && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setTypeFilter('all');
                      setFuelFilter('all');
                      setStatusFilter('all');
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    {lang === 'vi' ? 'Xóa Bộ Lọc' : 'Clear Filters'}
                  </button>
                )}
                <button
                  onClick={() => setIsAddVehicleOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addVehicle}</span>
                </button>
              </div>
            </div>
          ) : viewMode === 'table' ? (
            /* VIEW MODE 1: BẢNG ĐỘI XE CÔNG TY (TABLE VIEW) */
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center space-x-2">
                  <TableIcon className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {t.fleetTabVehicles} ({filteredVehicles.length} {t.kpiVehiclesUnit})
                  </h3>
                </div>
                {lastSyncTime && (
                  <span className="text-[11px] text-slate-500 font-medium">
                    {lang === 'vi' ? 'Đồng bộ lần cuối:' : 'Last sync:'}{' '}
                    {new Date(lastSyncTime).toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US')}
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4 whitespace-nowrap">{t.colVehicleCode}</th>
                      <th className="py-3 px-4 whitespace-nowrap">{t.colPlateNumber}</th>
                      <th className="py-3 px-4 whitespace-nowrap">{t.colModel}</th>
                      <th className="py-3 px-4 whitespace-nowrap">{t.colCategory}</th>
                      <th className="py-3 px-4 whitespace-nowrap">{t.colSeats}</th>
                      <th className="py-3 px-4 whitespace-nowrap">{t.colFuel}</th>
                      <th className="py-3 px-4 whitespace-nowrap">{t.colOdo}</th>
                      <th className="py-3 px-4 whitespace-nowrap">{t.colStatus}</th>
                      <th className="py-3 px-4 whitespace-nowrap text-right">{t.colActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                    {filteredVehicles.map((veh, index) => {
                      const isAvailable = veh.status === 'available';
                      const isInUse = veh.status === 'in_use';
                      const isMaintenance = veh.status === 'maintenance';
                      const defaultDriver = drivers.find((d) => d.id === veh.defaultDriverId);

                      return (
                        <tr
                          key={veh.id || index}
                          className="hover:bg-blue-50/40 transition-colors"
                        >
                          {/* 1. Mã Xe */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-mono font-bold text-xs px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg border border-slate-200 inline-block shadow-2xs">
                              {veh.code || `XE-${String(index + 1).padStart(2, '0')}`}
                            </span>
                          </td>

                          {/* 2. Biển Số */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-mono font-black text-xs px-3 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-lg shadow-2xs tracking-wider inline-flex items-center gap-1.5">
                              <Car className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span>{veh.plateNumber}</span>
                            </div>
                          </td>

                          {/* 3. Dòng Xe */}
                          <td className="py-3.5 px-4">
                            <div className="min-w-[150px]">
                              <span className="font-bold text-slate-900 text-sm block">
                                {veh.model}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {lang === 'vi' ? 'Năm' : 'Year'} {veh.year || 2023} • {veh.color || 'Standard'}
                                {defaultDriver && ` • ${t.primaryDriver}: ${defaultDriver.name}`}
                              </span>
                            </div>
                          </td>

                          {/* 4. Phân Loại */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                veh.type === 'sedan_4'
                                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                                  : veh.type === 'suv_7'
                                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  : veh.type === 'van_16'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {getVehicleTypeLabel(veh.type)}
                            </span>
                          </td>

                          {/* 5. Số Chỗ */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-semibold text-slate-800 bg-slate-100/80 px-2.5 py-1 rounded-lg text-xs border border-slate-200/60">
                              {veh.seats} {lang === 'vi' ? 'chỗ' : 'seats'}
                            </span>
                          </td>

                          {/* 6. Nhiên Liệu */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                                veh.fuelType === 'Điện'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : veh.fuelType === 'Dầu'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-orange-50 text-orange-800 border-orange-200'
                              }`}
                            >
                              {veh.fuelType === 'Điện' ? (
                                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Fuel className="w-3.5 h-3.5 text-slate-600" />
                              )}
                              <span>
                                {veh.fuelType === 'Điện'
                                  ? t.fuelType.electric
                                  : veh.fuelType === 'Dầu'
                                  ? t.fuelType.diesel
                                  : t.fuelType.gasoline}
                              </span>
                            </span>
                          </td>

                          {/* 7. Số ODO */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-800">
                              <Gauge className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{formatNumber(veh.currentMileage)} KM</span>
                            </div>
                          </td>

                          {/* 8. Trạng Thái */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                isAvailable
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : isInUse
                                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                                  : 'bg-rose-100 text-rose-800 border-rose-200'
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isAvailable
                                    ? 'bg-emerald-500'
                                    : isInUse
                                    ? 'bg-blue-500 animate-pulse'
                                    : 'bg-rose-500'
                                }`}
                              />
                              <span>{getVehicleStatusLabel(veh.status)}</span>
                            </span>
                          </td>

                          {/* 9. Thao Tác (Quick Status Change) */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => onUpdateVehicleStatus(veh.id, 'available')}
                                title={t.statusAvailable}
                                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                                  isAvailable
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700'
                                }`}
                              >
                                {t.statusAvailable}
                              </button>
                              <button
                                onClick={() => onUpdateVehicleStatus(veh.id, 'in_use')}
                                title={t.statusInUse}
                                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                                  isInUse
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700'
                                }`}
                              >
                                {t.statusInUse}
                              </button>
                              <button
                                onClick={() => onUpdateVehicleStatus(veh.id, 'maintenance')}
                                title={t.statusMaintenance}
                                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                                  isMaintenance
                                    ? 'bg-rose-600 text-white shadow-2xs'
                                    : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700'
                                }`}
                              >
                                {t.statusMaintenance}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="p-3.5 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
                <span>
                  {lang === 'vi' ? 'Hiển thị' : 'Showing'} <strong>{filteredVehicles.length}</strong> / {vehicles.length} {t.kpiVehiclesUnit}
                </span>
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {t.kpiAvailable}: <strong>{stats.available}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {t.kpiInUse}: <strong>{stats.inUse}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    {t.kpiMaintenance}: <strong>{stats.maintenance}</strong>
                  </span>
                </span>
              </div>
            </div>
          ) : (
            /* VIEW MODE 2: DẠNG THẺ (CARD GRID VIEW) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVehicles.map((veh, index) => {
                const isAvailable = veh.status === 'available';
                const isMaintenance = veh.status === 'maintenance';
                const defaultDriver = drivers.find((d) => d.id === veh.defaultDriverId);

                return (
                  <div
                    key={veh.id || index}
                    className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    <div>
                      {/* Top: Mã Xe, Plate & Status */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
                            {veh.code || `XE-${index + 1}`}
                          </span>
                          <span className="font-mono text-sm font-black px-2.5 py-0.5 bg-amber-50 text-amber-900 rounded-xl border border-amber-300">
                            {veh.plateNumber}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                            isAvailable
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : veh.status === 'in_use'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isAvailable
                                ? 'bg-emerald-500'
                                : veh.status === 'in_use'
                                ? 'bg-blue-500 animate-pulse'
                                : 'bg-rose-500'
                            }`}
                          />
                          {getVehicleStatusLabel(veh.status)}
                        </span>
                      </div>

                      {/* Model & Classification */}
                      <h4 className="text-base font-bold text-slate-900 mb-0.5">{veh.model}</h4>
                      <p className="text-xs text-slate-500 mb-3">
                        {getVehicleTypeLabel(veh.type)} • {veh.seats} {lang === 'vi' ? 'chỗ' : 'seats'} • {lang === 'vi' ? 'Năm' : 'Year'} {veh.year || 2023}
                      </p>

                      {/* Specs */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200/60 mb-3">
                        <div className="flex items-center gap-1.5">
                          {veh.fuelType === 'Điện' ? (
                            <Zap className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Fuel className="w-3.5 h-3.5 text-blue-600" />
                          )}
                          <span>
                            {veh.fuelType === 'Điện'
                              ? t.fuelType.electric
                              : veh.fuelType === 'Dầu'
                              ? t.fuelType.diesel
                              : t.fuelType.gasoline}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono">
                          <Gauge className="w-3.5 h-3.5 text-slate-500" />
                          <span>{formatNumber(veh.currentMileage)} KM</span>
                        </div>
                      </div>

                      {defaultDriver && (
                        <div className="text-xs text-slate-500 mb-2">
                          {t.primaryDriver}:{' '}
                          <strong className="text-slate-800">{defaultDriver.name}</strong>
                        </div>
                      )}
                    </div>

                    {/* Quick Toggle Status */}
                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">{t.changeStatus}:</span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => onUpdateVehicleStatus(veh.id, 'available')}
                          className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors ${
                            veh.status === 'available'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          {t.statusAvailable}
                        </button>
                        <button
                          onClick={() =>
                            onUpdateVehicleStatus(
                              veh.id,
                              veh.status === 'maintenance' ? 'available' : 'maintenance'
                            )
                          }
                          className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors ${
                            veh.status === 'maintenance'
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                          }`}
                        >
                          {t.statusMaintenance}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Đội Ngũ Tài Xế */}
      {activeTab === 'drivers' && (
        <>
          {drivers.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3">
              <User className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-700">
                {t.noDriversTitle}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {t.noDriversDesc}
              </p>
              <button
                onClick={() => setIsAddDriverOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addDriver}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {drivers.map((drv) => {
                const isActive = drv.status === 'active';
                const assignedVeh = vehicles.find((v) => v.id === drv.currentVehicleId);

                return (
                  <div
                    key={drv.id}
                    className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                          {drv.name.split(' ').slice(-1)[0][0]}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{drv.name}</h4>
                          <p className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {drv.phone}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/60 text-xs mb-3">
                        <div className="flex justify-between text-slate-600">
                          <span>{t.driverLicense}:</span>
                          <strong className="text-slate-800">
                            {lang === 'vi' ? 'Hạng' : 'Class'} {drv.licenseClass} ({drv.licenseNumber})
                          </strong>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>{t.driverExperience}:</span>
                          <strong className="text-slate-800">{drv.experienceYears} {t.years}</strong>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>{t.driverRating}:</span>
                          <span className="font-bold text-amber-600 flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            {drv.rating} / 5.0
                          </span>
                        </div>
                      </div>

                      {assignedVeh && (
                        <div className="text-[11px] text-slate-500 mb-2">
                          {t.driverAssignedTo}:{' '}
                          <strong className="text-slate-700">
                            {assignedVeh.model} ({assignedVeh.plateNumber})
                          </strong>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : drv.status === 'busy'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isActive ? t.driverStatusActive : drv.status === 'busy' ? t.driverStatusBusy : t.driverStatusOff}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal: Thêm xe mới */}
      {isAddVehicleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-600" />
              {t.modalAddVehicleTitle}
            </h3>
            <form onSubmit={handleCreateVehicle} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {t.colVehicleCode} ({lang === 'vi' ? 'Tùy chọn' : 'Optional'}):
                  </label>
                  <input
                    type="text"
                    placeholder="VD: XE-01, VF8-01"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {t.colPlateNumber} *:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 30A-999.88"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t.colModel} *:
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: VinFast VF 8 Plus, Toyota Camry..."
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {t.colCategory}:
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as VehicleType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="sedan_4">{getVehicleTypeLabel('sedan_4')}</option>
                    <option value="suv_7">{getVehicleTypeLabel('suv_7')}</option>
                    <option value="van_16">{getVehicleTypeLabel('van_16')}</option>
                    <option value="pickup">{getVehicleTypeLabel('pickup')}</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {t.colSeats}:
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="45"
                    value={newSeats}
                    onChange={(e) => setNewSeats(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {t.colFuel}:
                  </label>
                  <select
                    value={newFuel}
                    onChange={(e) => setNewFuel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="Điện">{t.fuelType.electric}</option>
                    <option value="Xăng">{t.fuelType.gasoline}</option>
                    <option value="Dầu">{t.fuelType.diesel}</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {t.colOdo} (KM):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newMileage}
                    onChange={(e) => setNewMileage(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {lang === 'vi' ? 'Màu sắc:' : 'Color:'}
                </label>
                <input
                  type="text"
                  placeholder="VD: Trắng, Đen, Xanh..."
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddVehicleOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Thêm tài xế mới */}
      {isAddDriverOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              {t.modalAddDriverTitle}
            </h3>
            <form onSubmit={handleCreateDriver} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {lang === 'vi' ? 'Họ và tên *:' : 'Full Name *:'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nguyễn Văn Bình"
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {lang === 'vi' ? 'Số điện thoại *:' : 'Phone Number *:'}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="VD: 0912 345 678"
                  value={newDriverPhone}
                  onChange={(e) => setNewDriverPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {t.driverLicense}:
                  </label>
                  <select
                    value={newDriverClass}
                    onChange={(e) => setNewDriverClass(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="B2">Hạng B2</option>
                    <option value="C">Hạng C</option>
                    <option value="D">Hạng D</option>
                    <option value="E">Hạng E</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {t.driverExperience} ({t.years}):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={newDriverExp}
                    onChange={(e) => setNewDriverExp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {lang === 'vi' ? 'Số giấy phép lái xe:' : 'License Number:'}
                </label>
                <input
                  type="text"
                  placeholder="VD: 010199001234"
                  value={newDriverLicense}
                  onChange={(e) => setNewDriverLicense(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddDriverOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
