import React, { useState } from 'react';
import {
  X,
  Car,
  MapPin,
  Calendar,
  Clock,
  Users,
  ShieldAlert,
  FileText,
  Send,
  Navigation,
  Compass,
  Check,
} from 'lucide-react';
import { Booking, VehicleType, Priority, TripType } from '../types/fleet';
import { DEPARTMENTS, POPULAR_LOCATIONS } from '../data/mockData';
import { useLanguage } from '../i18n/LanguageContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newBooking: Partial<Booking>) => void;
  currentUserEmail?: string;
  currentUserName?: string;
  currentUserPhone?: string;
  currentUserDepartment?: string;
  departments?: string[];
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUserEmail = '',
  currentUserName = '',
  currentUserPhone = '',
  currentUserDepartment = '',
  departments = DEPARTMENTS,
}) => {
  const { lang, t, getVehicleTypeLabel } = useLanguage();

  const [department, setDepartment] = useState(
    currentUserDepartment || (departments.length > 0 ? departments[0] : 'Phòng Ban')
  );
  const [requesterName, setRequesterName] = useState(currentUserName || (lang === 'vi' ? 'Nguyễn Văn An' : 'John Doe'));
  const [requesterPhone, setRequesterPhone] = useState(currentUserPhone || '0912 345 678');
  const [requesterEmail, setRequesterEmail] = useState(currentUserEmail || 'an.nguyen@company.com');

  React.useEffect(() => {
    if (isOpen) {
      if (currentUserName) setRequesterName(currentUserName);
      if (currentUserEmail) setRequesterEmail(currentUserEmail);
      if (currentUserPhone) setRequesterPhone(currentUserPhone);
      if (currentUserDepartment) setDepartment(currentUserDepartment);
    }
  }, [isOpen, currentUserName, currentUserEmail, currentUserPhone, currentUserDepartment]);

  const [purpose, setPurpose] = useState('');
  const [pickupLocation, setPickupLocation] = useState(POPULAR_LOCATIONS[0]);
  const [destination, setDestination] = useState(POPULAR_LOCATIONS[4]); // Sân bay

  const todayStr = new Date().toISOString().split('T')[0];
  const [departureDate, setDepartureDate] = useState(todayStr);
  const [departureTime, setDepartureTime] = useState('09:00');

  const [tripType, setTripType] = useState<TripType>('round-trip');
  const [returnDate, setReturnDate] = useState(todayStr);
  const [returnTime, setReturnTime] = useState('17:00');

  const [vehicleTypeNeeded, setVehicleTypeNeeded] = useState<VehicleType>('suv_7');
  const [passengerCount, setPassengerCount] = useState(3);
  const [passengerListText, setPassengerListText] = useState('');
  const [priority, setPriority] = useState<Priority>('normal');
  const [notes, setNotes] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState<string[]>([]);

  if (!isOpen) return null;

  const quickPurposes = lang === 'vi' ? [
    'Gặp gỡ ký kết đối tác',
    'Khảo sát công trường / Nhà máy',
    'Đưa đón khách VIP sân bay',
    'Đi công tác ngoại tỉnh',
    'Tham gia sự kiện / Hội nghị',
    'Vận chuyển tài liệu & thiết bị',
  ] : [
    'Partner signing & client meeting',
    'Site survey / Factory inspection',
    'VIP airport pickup / dropoff',
    'Inter-province business travel',
    'Conference / Corporate summit',
    'Documents & equipment delivery',
  ];

  const vehicleOptions: {
    type: VehicleType;
    title: string;
    desc: string;
    seats: string;
    icon: string;
  }[] = [
    {
      type: 'sedan_4',
      title: lang === 'vi' ? 'Sedan 4-5 Chỗ' : 'Sedan 4-5 Seats',
      desc: 'Camry, VinFast VF8, Mazda 6...',
      seats: lang === 'vi' ? 'Tối đa 4 người' : 'Up to 4 pax',
      icon: '🚗',
    },
    {
      type: 'suv_7',
      title: lang === 'vi' ? 'SUV / MPV 7 Chỗ' : 'SUV / MPV 7 Seats',
      desc: 'Ford Everest, Fortuner, Carnival...',
      seats: lang === 'vi' ? 'Tối đa 7 người' : 'Up to 7 pax',
      icon: '🚙',
    },
    {
      type: 'van_16',
      title: lang === 'vi' ? 'Xe Khách 16 Chỗ' : '16-Seat Minibus',
      desc: 'Hyundai Solati VIP, Ford Transit...',
      seats: lang === 'vi' ? 'Tối đa 16 người' : 'Up to 16 pax',
      icon: '🚐',
    },
    {
      type: 'pickup',
      title: lang === 'vi' ? 'Bán Tải Chở Hàng' : 'Pickup Truck',
      desc: 'Ford Ranger, Hilux...',
      seats: lang === 'vi' ? '4 người + Thùng hàng' : '4 pax + Cargo bed',
      icon: '🛻',
    },
  ];

  const availableRequirements = lang === 'vi' ? [
    'Cần tài xế giao tiếp tiếng Anh',
    'Chờ đón tại điểm đến',
    'Hành lý / Thiết bị cồng kềnh',
    'Trang bị nước suối & khăn lạnh',
  ] : [
    'English-speaking driver required',
    'Driver standby at destination',
    'Bulky luggage / equipment',
    'Bottled water & amenities',
  ];

  const toggleRequirement = (req: string) => {
    if (specialRequirements.includes(req)) {
      setSpecialRequirements(specialRequirements.filter((r) => r !== req));
    } else {
      setSpecialRequirements([...specialRequirements, req]);
    }
  };

  // Rough distance calculation based on selected locations
  const calculateEstimatedDistance = () => {
    if (destination.includes('Sân bay Nội Bài') || destination.includes('Airport')) return 32;
    if (destination.includes('Bắc Ninh')) return 45;
    if (destination.includes('Hải Phòng')) return 125;
    if (destination.includes('Bình Dương')) return 35;
    if (destination.includes('JW Marriott') || destination.includes('Hội nghị Quốc gia')) return 8;
    return 20;
  };

  const estimatedDist = calculateEstimatedDistance() * (tripType === 'round-trip' ? 2 : 1);
  const estimatedMin = Math.round(estimatedDist * 2.2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!purpose.trim()) {
      alert(lang === 'vi' ? 'Vui lòng nhập mục đích chuyến đi!' : 'Please enter trip purpose!');
      return;
    }

    const departureIso = `${departureDate}T${departureTime}:00`;
    const returnIso = tripType === 'round-trip' ? `${returnDate}T${returnTime}:00` : undefined;

    const passengerNames = passengerListText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    onSubmit({
      requesterName,
      requesterPhone,
      requesterEmail,
      department,
      purpose,
      pickupLocation,
      destination,
      departureTime: departureIso,
      returnTime: returnIso,
      tripType,
      vehicleTypeNeeded,
      passengerCount: Number(passengerCount),
      passengerList: passengerNames.length > 0 ? passengerNames : [requesterName],
      priority,
      notes,
      specialRequirements,
      estimatedDistanceKm: estimatedDist,
      estimatedDurationMin: estimatedMin,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{t.modalBookingTitle}</h3>
              <p className="text-xs text-blue-100">
                {lang === 'vi'
                  ? 'Gửi yêu cầu điều phối xe công tác cho cán bộ nhân viên'
                  : 'Submit corporate vehicle request for dispatch approval'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section 1: Thông tin người đặt */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              {lang === 'vi' ? '1. Thông Tin Người Đặt & Phòng Ban' : '1. Requester & Department Information'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  {lang === 'vi' ? 'Họ và tên:' : 'Full Name:'}
                </label>
                <input
                  type="text"
                  required
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  {t.department}:
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  {t.phone}:
                </label>
                <input
                  type="tel"
                  required
                  value={requesterPhone}
                  onChange={(e) => setRequesterPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  {lang === 'vi' ? 'Email công ty:' : 'Work Email:'}
                </label>
                <input
                  type="email"
                  required
                  value={requesterEmail}
                  onChange={(e) => setRequesterEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Mục đích & Lộ trình */}
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              {lang === 'vi' ? '2. Mục Đích & Lộ Trình Di Chuyển' : '2. Purpose & Trip Route'}
            </span>

            {/* Mục đích */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                {t.purpose} <span className="text-rose-500">*</span>:
              </label>
              <input
                type="text"
                required
                placeholder={lang === 'vi' ? 'VD: Gặp khách hàng ký hợp đồng dự án tại khách sạn JW Marriott...' : 'e.g. Client contract signing at JW Marriott...'}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickPurposes.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPurpose(p)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-colors border border-slate-200/60"
                  >
                    + {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Điểm đón & Điểm đến */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t.pickupPoint}</span>
                </label>
                <input
                  type="text"
                  required
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <select
                  onChange={(e) => {
                    if (e.target.value) setPickupLocation(e.target.value);
                  }}
                  className="mt-1 text-[11px] text-slate-500 bg-transparent border-0 underline cursor-pointer"
                >
                  <option value="">{lang === 'vi' ? 'Chọn từ địa điểm nội bộ...' : 'Select company point...'}</option>
                  {POPULAR_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.destinationPoint}</span>
                </label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <select
                  onChange={(e) => {
                    if (e.target.value) setDestination(e.target.value);
                  }}
                  className="mt-1 text-[11px] text-slate-500 bg-transparent border-0 underline cursor-pointer"
                >
                  <option value="">{lang === 'vi' ? 'Chọn từ địa điểm nội bộ...' : 'Select company point...'}</option>
                  {POPULAR_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Thời gian & Khứ hồi / Một chiều */}
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900">
                  {lang === 'vi' ? 'Hình thức di chuyển:' : 'Trip type:'}
                </span>
                <div className="flex bg-white rounded-xl p-1 border border-blue-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setTripType('round-trip')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      tripType === 'round-trip'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.tripType['round-trip']}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTripType('one-way')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      tripType === 'one-way'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.tripType['one-way']}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Giờ xuất phát */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {lang === 'vi' ? 'Ngày & giờ khởi hành:' : 'Departure Date & Time:'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <input
                      type="time"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Giờ về nếu khứ hồi */}
                {tripType === 'round-trip' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      {lang === 'vi' ? 'Ngày & giờ về dự kiến:' : 'Return Date & Time:'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <input
                        type="time"
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Estimate Preview */}
              <div className="flex items-center justify-between text-xs text-blue-700 bg-white/80 p-2.5 rounded-xl border border-blue-100">
                <span className="flex items-center gap-1.5 font-medium">
                  <Compass className="w-4 h-4 text-blue-600" />
                  {lang === 'vi' ? 'Ước tính khoảng cách:' : 'Est. distance:'}{' '}
                  <strong className="text-blue-900">{estimatedDist} km</strong>
                </span>
                <span className="font-medium">
                  {lang === 'vi' ? 'Thời gian xe chạy dự kiến:' : 'Est. travel time:'} ~{estimatedMin} {lang === 'vi' ? 'phút' : 'min'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Loại xe & Hành khách */}
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              {lang === 'vi' ? '3. Loại Xe Yêu Cầu & Danh Sách Đoàn' : '3. Requested Vehicle & Passenger Roster'}
            </span>

            {/* Vehicle Type Selection Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {vehicleOptions.map((v) => {
                const isSelected = vehicleTypeNeeded === v.type;
                return (
                  <div
                    key={v.type}
                    onClick={() => setVehicleTypeNeeded(v.type)}
                    className={`cursor-pointer p-3 rounded-2xl border transition-all text-left relative ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{v.icon}</div>
                    <div className="text-xs font-bold text-slate-800">{v.title}</div>
                    <div className="text-[11px] text-slate-500 truncate">{v.desc}</div>
                    <div className="text-[10px] text-blue-600 font-semibold mt-1">{v.seats}</div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Số người & Danh sách hành khách */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t.passengers}:
                </label>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    max="45"
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                  />
                  <span className="text-xs text-slate-500">{lang === 'vi' ? 'người' : 'pax'}</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {lang === 'vi' ? 'Mức độ ưu tiên:' : 'Priority Level:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'normal', label: lang === 'vi' ? 'Bình thường' : 'Normal', color: 'text-slate-700' },
                    { val: 'urgent', label: lang === 'vi' ? 'Khẩn cấp / Gấp' : 'Urgent', color: 'text-amber-700' },
                    { val: 'vip', label: 'VIP', color: 'text-purple-700' },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setPriority(p.val as Priority)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        priority === p.val
                          ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-500'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chi tiết thành viên đi cùng */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {lang === 'vi' ? 'Danh sách người đi cùng:' : 'Passenger roster (one per line):'}
              </label>
              <textarea
                rows={2}
                placeholder={lang === 'vi' ? 'VD: Nguyễn Văn A (TP), Lê Thị B (NV)...' : 'e.g. John Doe (Manager), Jane Smith...'}
                value={passengerListText}
                onChange={(e) => setPassengerListText(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Yêu cầu đặc biệt */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                {lang === 'vi' ? 'Yêu cầu bổ sung:' : 'Special requirements:'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableRequirements.map((req) => (
                  <label
                    key={req}
                    className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200"
                  >
                    <input
                      type="checkbox"
                      checked={specialRequirements.includes(req)}
                      onChange={() => toggleRequirement(req)}
                      className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500"
                    />
                    <span>{req}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Ghi chú thêm */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {t.notes}:
              </label>
              <input
                type="text"
                placeholder={lang === 'vi' ? 'VD: Cần đón đúng giờ vì có chuyến bay sát giờ...' : 'e.g. Flight is early morning, please be on time...'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
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
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{lang === 'vi' ? 'Gửi Phiếu Đăng Ký Đặt Xe' : 'Submit Vehicle Request'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
