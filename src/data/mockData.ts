import { Vehicle, Driver, Booking, NumericRole, UserProfile } from '../types/fleet';

export const DEPARTMENTS = [
  'Phòng Kinh Doanh',
  'Phòng Kỹ Thuật & Dự Án',
  'Phòng Marketing',
  'Ban Giám Đốc',
  'Phòng Nhân Sự & Hành Chính',
  'Phòng Kế Toán & Tài Chính',
  'Khối Vận Hành',
];

export const POPULAR_LOCATIONS = [
  'Nhà máy: Road 4A, Bau Xeo I.P,Trang Bom Commune, Dong Nai City,',
  'Văn phòng HCM: 62 Nguyen Quy Duc, Binh Trung Ward, HCM City',
  'Sân bay Quốc tế Nội Bài (Nhà ga T1/T2)',
  'Sân bay Quốc tế Tân Sơn Nhất',
];

// Profile mặc định cho từng vai trò kiểm thử (Role 0: Admin, 1 -> 4)
export const DEFAULT_PROFILES: Record<NumericRole, UserProfile> = {
  0: {
    id: 'user_admin_01',
    name: 'Quản Trị Viên (Admin)',
    email: 'admin@company.com',
    phone: '0909 888 999',
    role: 0,
    department: 'Ban Giám Đốc',
    isAdmin: true,
  },
  1: {
    id: 'user_emp_01',
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@company.com',
    phone: '0912 345 678',
    role: 1,
    department: 'Phòng Kinh Doanh',
  },
  2: {
    id: 'user_mgr_01',
    name: 'Trần Thị Bình',
    email: 'binh.tran@company.com',
    phone: '0903 112 233',
    role: 2,
    department: 'Phòng Kinh Doanh',
  },
  3: {
    id: 'user_disp_01',
    name: 'Phạm Văn Chiến',
    email: 'dieuphoi@company.com',
    phone: '0988 555 777',
    role: 3,
    department: 'Bộ Phận Điều Phối Xe',
  },
  4: {
    id: 'user_drv_01',
    name: 'Lê Văn Cường',
    driverId: 'drv_01',
    email: 'taixe.cuong@company.com',
    phone: '0901 234 567',
    role: 4,
    department: 'Đội Xe Công Ty',
  },
};

// Toàn bộ dữ liệu ban đầu để trống (Không sử dụng mock data)
export const INITIAL_VEHICLES: Vehicle[] = [];
export const INITIAL_DRIVERS: Driver[] = [];
export const INITIAL_BOOKINGS: Booking[] = [];
