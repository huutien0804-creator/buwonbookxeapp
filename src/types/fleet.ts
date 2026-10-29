export type NumericRole = 0 | 1 | 2 | 3 | 4;
export const ROLE_ADMIN: NumericRole = 0;
export const ROLE_EMPLOYEE: NumericRole = 1;
export const ROLE_MANAGER: NumericRole = 2;
export const ROLE_DISPATCHER: NumericRole = 3;
export const ROLE_DRIVER: NumericRole = 4;

export type UserRole = 'admin' | 'employee' | 'manager' | 'dispatcher' | 'driver';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: NumericRole;
  department: string;
  driverId?: string;
  isAdmin?: boolean;
}

export interface SheetUser {
  email: string;
  name: string;
  department: string;
  roleStr: string;
  numericRole: NumericRole;
  isAdmin?: boolean;
}

export const ROLE_MAP: Record<NumericRole, UserRole> = {
  0: 'admin',
  1: 'employee',
  2: 'manager',
  3: 'dispatcher',
  4: 'driver',
};

export const ROLE_FROM_STRING: Record<UserRole, NumericRole> = {
  admin: 0,
  employee: 1,
  manager: 2,
  dispatcher: 3,
  driver: 4,
};

export type BookingStatus =
  | 'pending_manager'  // Chờ Trưởng bộ phận duyệt
  | 'pending_dispatch' // Đã duyệt, chờ Điều phối xếp xe & tài xế
  | 'assigned'         // Đã phân công xe và tài xế
  | 'in_progress'      // Đang thực hiện chuyến đi
  | 'completed'        // Chuyến đi hoàn thành
  | 'rejected'         // Bị từ chối
  | 'cancelled';       // Đã hủy

export type VehicleType = 'sedan_4' | 'suv_7' | 'van_16' | 'pickup';

export type VehicleStatus = 'available' | 'in_use' | 'maintenance';

export type Priority = 'normal' | 'urgent' | 'vip';

export type TripType = 'one-way' | 'round-trip';

export interface Vehicle {
  id: string;
  code?: string;       // Mã Xe (VD: XE-01, VF8-01)
  plateNumber: string; // Biển Số: 30A-888.88
  model: string;       // Dòng Xe: Toyota Camry, VinFast VF8...
  type: VehicleType;   // Phân Loại: sedan_4, suv_7, van_16, pickup
  seats: number;       // Số Chỗ: 4, 7, 16...
  fuelType: 'Xăng' | 'Dầu' | 'Điện'; // Nhiên Liệu
  currentMileage: number; // Số ODO (km)
  status: VehicleStatus;  // Trạng Thái: available, in_use, maintenance
  defaultDriverId?: string;
  color?: string;
  imageUrl?: string;
  fuelEconomy?: string;
  year?: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email?: string;
  licenseNumber: string;
  licenseClass: 'B2' | 'C' | 'D' | 'E';
  experienceYears: number;
  rating: number; // 4.8 / 5
  status: 'active' | 'busy' | 'off_duty';
  avatarUrl?: string;
  currentVehicleId?: string;
}

export interface Booking {
  id: string;
  code: string; // Mã phiếu: BK-202610-001
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  department: string; // Kinh Doanh, Kỹ Thuật, Nhân Sự, Ban Giám Đốc, Marketing, Tài Chính
  purpose: string; // Gặp khách hàng, Đi thị trường, Đưa đón đối tác sân bay, Đi công tác tỉnh...
  
  pickupLocation: string; // Điểm đón
  destination: string;    // Điểm đến
  departureTime: string;  // ISO string
  returnTime?: string;    // ISO string nếu khứ hồi
  tripType: TripType;
  
  vehicleTypeNeeded: VehicleType;
  passengerCount: number;
  passengerList?: string[]; // Danh sách người đi cùng
  priority: Priority;
  
  notes?: string;
  specialRequirements?: string[]; // "Cần tài xế biết tiếng Anh", "Có hàng hóa cồng kềnh", "Chờ tại điểm đến"
  
  // Status and Workflow
  status: BookingStatus;
  managerApprovedAt?: string;
  managerApprovedBy?: string;
  rejectionReason?: string;
  
  // Dispatch Assignment
  assignedVehicleId?: string;
  assignedDriverId?: string;
  dispatchedAt?: string;
  dispatchedBy?: string;
  
  // Trip execution metrics
  startedAt?: string;
  completedAt?: string;
  estimatedDistanceKm: number;
  estimatedDurationMin: number;
  actualDistanceKm?: number;
  startOdometer?: number;
  endOdometer?: number;
  tollFee?: number;   // Phí cầu đường (VND)
  fuelCost?: number;  // Chi phí xăng/dầu (VND)
  driverNotes?: string;
  
  // Google Sheets Sync
  syncedToSheets?: boolean;
  sheetsRowIndex?: number;
  lastSyncedAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface SheetsConfig {
  spreadsheetId: string | null;
  spreadsheetTitle: string;
  spreadsheetUrl: string | null;
  sheetName: string;
  autoSync: boolean;
  lastSyncTime: string | null;
}

export interface DepartmentSummary {
  name: string;
  count: number;
  totalKm: number;
}
