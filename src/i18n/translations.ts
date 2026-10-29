import { BookingStatus, VehicleStatus, VehicleType, UserRole, TripType } from '../types/fleet';

export type Language = 'vi' | 'en';

export interface Translations {
  // Brand & Header
  appTitle: string;
  appBadge: string;
  appSubtitle: string;
  roles: Record<UserRole, string>;
  roleDescriptions: Record<UserRole, string>;

  // Navigation Tabs
  navBookings: string;
  navTimeline: string;
  navFleet: string;
  navAnalytics: string;

  // Actions & Buttons
  newBooking: string;
  connectSheets: string;
  googleSheets: string;
  quickSync: string;
  pullFromSheets: string;
  refreshFromSheets: string;
  syncing: string;
  readingSheets: string;
  routeEstimator: string;
  clearLocalData: string;
  viewGoogleSheet: string;
  logout: string;
  loginGoogle: string;
  loginWithGoogle: string;
  cancel: string;
  confirm: string;
  save: string;
  close: string;
  search: string;
  all: string;
  filter: string;
  viewTable: string;
  viewGrid: string;
  actions: string;

  // Filter & Search
  searchPlaceholder: string;
  allStatuses: string;
  allDepartments: string;
  allVehicleTypes: string;
  allFuelTypes: string;

  // Statuses
  bookingStatus: Record<BookingStatus, string>;
  vehicleStatus: Record<VehicleStatus, string>;
  vehicleType: Record<VehicleType, string>;
  tripType: Record<TripType, string>;
  fuelType: {
    electric: string;
    gasoline: string;
    diesel: string;
  };

  // Fleet Table Columns
  colVehicleCode: string;
  colPlateNumber: string;
  colModel: string;
  colCategory: string;
  colSeats: string;
  colFuel: string;
  colOdo: string;
  colStatus: string;
  colActions: string;

  // Fleet KPIs
  kpiTotalFleet: string;
  kpiAvailable: string;
  kpiInUse: string;
  kpiMaintenance: string;
  kpiTotalVehicles: string;
  kpiVehiclesUnit: string;

  // Fleet UI & Drivers
  fleetTabVehicles: string;
  fleetTabDrivers: string;
  addVehicle: string;
  addDriver: string;
  primaryDriver: string;
  changeStatus: string;
  statusAvailable: string;
  statusInUse: string;
  statusMaintenance: string;
  noVehiclesTitle: string;
  noVehiclesDesc: string;
  noDriversTitle: string;
  noDriversDesc: string;
  driverLicense: string;
  driverExperience: string;
  driverRating: string;
  driverAssignedTo: string;
  driverStatusActive: string;
  driverStatusBusy: string;
  driverStatusOff: string;
  years: string;

  // Bookings list
  noBookingsTitle: string;
  noBookingsDesc: string;
  firstBookingCta: string;
  bookingCode: string;
  requester: string;
  department: string;
  phone: string;
  purpose: string;
  route: string;
  pickupPoint: string;
  destinationPoint: string;
  departureTime: string;
  returnTime: string;
  passengers: string;
  distanceKm: string;
  assignedVehicle: string;
  assignedDriver: string;
  notAssigned: string;
  notes: string;
  syncedBadge: string;
  unSyncedBadge: string;

  // Booking Card Actions
  btnApprove: string;
  btnReject: string;
  btnDispatch: string;
  btnStartTrip: string;
  btnCompleteTrip: string;
  btnCancelTrip: string;
  btnSyncToSheet: string;

  // Modals
  modalBookingTitle: string;
  modalDispatchTitle: string;
  modalCompleteTitle: string;
  modalSheetsTitle: string;
  modalRouteTitle: string;
  modalAddVehicleTitle: string;
  modalAddDriverTitle: string;

  // Timeline
  timelineTitle: string;
  timelineSubtitle: string;
  timelineToday: string;
  timelineVehicleColumn: string;
  timelineNoTrips: string;

  // Analytics
  analyticsTitle: string;
  analyticsSubtitle: string;
  totalTrips: string;
  completedTrips: string;
  totalDistance: string;
  totalTollFee: string;
  totalFuelCost: string;
  tripsByDepartment: string;
  vehicleUtilization: string;

  // Feedback Messages
  syncSuccess: string;
  syncFailed: string;
  refreshSuccess: string;
  refreshFailed: string;
  clearSuccess: string;
  approvedSuccess: string;
  rejectedSuccess: string;
  dispatchedSuccess: string;
  startedSuccess: string;
  completedSuccess: string;
  cancelledSuccess: string;
  bookingCreatedSuccess: string;
}

export const translations: Record<Language, Translations> = {
  vi: {
    // Brand & Header
    appTitle: 'AutoFleet',
    appBadge: 'Nội Bộ',
    appSubtitle: 'Hệ thống điều phối xe & Quản lý chuyến công tác',
    roles: {
      admin: 'Quản Trị Viên (Admin)',
      employee: 'Nhân Viên',
      manager: 'Trưởng Bộ Phận',
      dispatcher: 'Điều Phối Xe',
      driver: 'Tài Xế',
    },
    roleDescriptions: {
      admin: 'Toàn quyền quản trị hệ thống: duyệt, xếp xe, xem toàn bộ dữ liệu và chuyển đổi góc nhìn',
      employee: 'Tạo phiếu đặt xe công tác và theo dõi tiến độ duyệt',
      manager: 'Duyệt hoặc từ chối các yêu cầu xe của nhân viên phòng ban',
      dispatcher: 'Điều phối xếp xe & phân công tài xế, quản lý đội xe',
      driver: 'Tiếp nhận lệnh điều xe, cập nhật chuyến đi và số ODO',
    },

    // Navigation Tabs
    navBookings: 'Phiếu Đặt Xe',
    navTimeline: 'Lịch Trình Đội Xe',
    navFleet: 'Đội Xe & Tài Xế',
    navAnalytics: 'Báo Cáo & Thống Kê',

    // Actions & Buttons
    newBooking: 'Đặt Xe Mới',
    connectSheets: 'Kết Nối Sheets',
    googleSheets: 'Google Sheets',
    quickSync: 'Đồng Bộ Lên Sheets',
    pullFromSheets: 'Đọc Từ Sheets',
    refreshFromSheets: 'Làm Mới Từ Sheets',
    syncing: 'Đang đồng bộ...',
    readingSheets: 'Đang đọc Sheets...',
    routeEstimator: 'Tính Cự Ly',
    clearLocalData: 'Xóa Dữ Liệu Tạm',
    viewGoogleSheet: 'Mở File Google Sheet',
    logout: 'Đăng xuất',
    loginGoogle: 'Đăng Nhập Google',
    loginWithGoogle: 'Đăng nhập với Google',
    cancel: 'Hủy',
    confirm: 'Xác Nhận',
    save: 'Lưu',
    close: 'Đóng',
    search: 'Tìm kiếm',
    all: 'Tất cả',
    filter: 'Bộ lọc',
    viewTable: 'Dạng Bảng',
    viewGrid: 'Dạng Thẻ',
    actions: 'Thao Tác',

    // Filter & Search
    searchPlaceholder: 'Tìm theo mã phiếu, người đặt, biển số xe, điểm đến...',
    allStatuses: 'Tất cả trạng thái',
    allDepartments: 'Tất cả phòng ban',
    allVehicleTypes: 'Tất cả phân loại',
    allFuelTypes: 'Tất cả nhiên liệu',

    // Statuses
    bookingStatus: {
      pending_manager: 'Chờ Quản Lý Duyệt',
      pending_dispatch: 'Chờ Điều Phối Xếp Xe',
      assigned: 'Đã Phân Xe & Tài Xế',
      in_progress: 'Đang Thực Hiện',
      completed: 'Hoàn Thành',
      rejected: 'Bị Từ Chối',
      cancelled: 'Đã Hủy',
    },
    vehicleStatus: {
      available: 'Sẵn sàng',
      in_use: 'Đang công tác',
      maintenance: 'Bảo dưỡng',
    },
    vehicleType: {
      sedan_4: 'Sedan 4-5 chỗ',
      suv_7: 'SUV/Crossover 7 chỗ',
      van_16: 'Xe 16 chỗ Solati/Ford',
      pickup: 'Bán tải chở hàng',
    },
    tripType: {
      'one-way': 'Một chiều',
      'round-trip': 'Khứ hồi',
    },
    fuelType: {
      electric: 'Điện (EV)',
      gasoline: 'Xăng',
      diesel: 'Dầu Diesel',
    },

    // Fleet Table Columns
    colVehicleCode: 'Mã Xe',
    colPlateNumber: 'Biển Số',
    colModel: 'Dòng Xe',
    colCategory: 'Phân Loại',
    colSeats: 'Số Chỗ',
    colFuel: 'Nhiên Liệu',
    colOdo: 'Số ODO',
    colStatus: 'Trạng Thái',
    colActions: 'Thao Tác',

    // Fleet KPIs
    kpiTotalFleet: 'Tổng Đội Xe',
    kpiAvailable: 'Sẵn Sàng Đi',
    kpiInUse: 'Đang Công Tác',
    kpiMaintenance: 'Bảo Dưỡng',
    kpiTotalVehicles: 'Tổng số xe',
    kpiVehiclesUnit: 'xe',

    // Fleet UI & Drivers
    fleetTabVehicles: 'Đội Xe Công Ty',
    fleetTabDrivers: 'Đội Ngũ Tài Xế',
    addVehicle: 'Thêm Phương Tiện Mới',
    addDriver: 'Thêm Tài Xế Mới',
    primaryDriver: 'Lái xe chính',
    changeStatus: 'Trạng thái xe',
    statusAvailable: 'Sẵn Sàng',
    statusInUse: 'Công Tác',
    statusMaintenance: 'Bảo Dưỡng',
    noVehiclesTitle: 'Chưa có phương tiện nào trong danh sách xe',
    noVehiclesDesc: 'Dữ liệu đang trống. Hãy bấm "Làm Mới Từ Sheets" để đọc tab "Đội Xe Công Ty" từ Google Sheets hoặc thêm xe mới.',
    noDriversTitle: 'Chưa có tài xế nào trong danh sách',
    noDriversDesc: 'Dữ liệu hiện đang trống. Hãy thêm thông tin tài xế của công ty hoặc đọc từ Google Sheets.',
    driverLicense: 'Bằng lái',
    driverExperience: 'Kinh nghiệm',
    driverRating: 'Đánh giá',
    driverAssignedTo: 'Phụ trách xe',
    driverStatusActive: 'Sẵn sàng nhận chuyến',
    driverStatusBusy: 'Đang chạy',
    driverStatusOff: 'Nghỉ ca',
    years: 'năm',

    // Bookings list
    noBookingsTitle: 'Chưa có phiếu đặt xe nào',
    noBookingsDesc: 'Toàn bộ dữ liệu mẫu đã xóa sạch. Danh sách sẽ hiển thị dữ liệu thực từ Google Sheets hoặc phiếu mới bạn tạo.',
    firstBookingCta: 'Đăng Ký Đặt Xe Đầu Tiên',
    bookingCode: 'Mã Phiếu',
    requester: 'Người đặt',
    department: 'Phòng ban',
    phone: 'Số ĐT',
    purpose: 'Mục đích',
    route: 'Lộ trình',
    pickupPoint: 'Điểm đón',
    destinationPoint: 'Điểm đến',
    departureTime: 'Khởi hành',
    returnTime: 'Về lại',
    passengers: 'Hành khách',
    distanceKm: 'Cự ly dự kiến',
    assignedVehicle: 'Xe phục vụ',
    assignedDriver: 'Tài xế',
    notAssigned: 'Chưa phân công',
    notes: 'Ghi chú',
    syncedBadge: 'Đã lên Sheets',
    unSyncedBadge: 'Chưa đồng bộ',

    // Booking Card Actions
    btnApprove: 'Phê Duyệt',
    btnReject: 'Từ Chối',
    btnDispatch: 'Điều Phối Xếp Xe',
    btnStartTrip: 'Bắt Đầu Chuyến',
    btnCompleteTrip: 'Hoàn Thành Chuyến',
    btnCancelTrip: 'Hủy Yêu Cầu',
    btnSyncToSheet: 'Đồng bộ Sheets',

    // Modals
    modalBookingTitle: 'Đăng Ký Đặt Xe Công Tác',
    modalDispatchTitle: 'Điều Phối Xe & Phân Công Tài Xế',
    modalCompleteTitle: 'Xác Nhận Hoàn Thành Chuyến Đi',
    modalSheetsTitle: 'Cấu Hình Google Sheets & Đồng Bộ',
    modalRouteTitle: 'Ước Tính Cự Ly & Chi Phí Xăng Xe',
    modalAddVehicleTitle: 'Thêm Phương Tiện Vào Đội Xe',
    modalAddDriverTitle: 'Thêm Tài Xế Mới',

    // Timeline
    timelineTitle: 'Lịch Trình Điều Xe Trực Quan',
    timelineSubtitle: 'Theo dõi tình trạng bận/rảnh của từng xe theo thời gian thực',
    timelineToday: 'Hôm nay',
    timelineVehicleColumn: 'Phương Tiện',
    timelineNoTrips: 'Không có chuyến xe nào trong ngày này',

    // Analytics
    analyticsTitle: 'Báo Cáo & Phân Tích Hoạt Động',
    analyticsSubtitle: 'Tổng hợp chi phí xăng xe, phí cầu đường và hiệu suất điều phối',
    totalTrips: 'Tổng Số Chuyến',
    completedTrips: 'Chuyến Hoàn Thành',
    totalDistance: 'Tổng Quãng Đường',
    totalTollFee: 'Tổng Phí Cầu Đường',
    totalFuelCost: 'Tổng Chi Phí Xăng',
    tripsByDepartment: 'Số chuyến theo phòng ban',
    vehicleUtilization: 'Tần suất sử dụng xe',

    // Feedback Messages
    syncSuccess: '✓ Đồng bộ dữ liệu lên Google Sheets hoàn tất!',
    syncFailed: '⚠️ Đồng bộ thất bại: ',
    refreshSuccess: '✓ Đã làm mới từ Google Sheets thành công!',
    refreshFailed: '⚠️ Lỗi khi tải dữ liệu từ Google Sheets: ',
    clearSuccess: '✓ Đã xóa toàn bộ dữ liệu tạm về danh sách trống.',
    approvedSuccess: '✓ Đã phê duyệt yêu cầu đặt xe.',
    rejectedSuccess: '✓ Đã từ chối yêu cầu đặt xe.',
    dispatchedSuccess: '✓ Đã điều phối xe và tài xế thành công.',
    startedSuccess: '✓ Chuyến đi đã bắt đầu khởi hành.',
    completedSuccess: '✓ Chuyến đi đã hoàn thành và lưu kết quả.',
    cancelledSuccess: '✓ Đã hủy phiếu đặt xe.',
    bookingCreatedSuccess: '✓ Đã gửi yêu cầu đặt xe thành công.',
  },

  en: {
    // Brand & Header
    appTitle: 'AutoFleet',
    appBadge: 'Internal',
    appSubtitle: 'Corporate Fleet Management & Business Trip Dispatch',
    roles: {
      admin: 'System Admin',
      employee: 'Employee',
      manager: 'Dept Manager',
      dispatcher: 'Fleet Dispatcher',
      driver: 'Driver',
    },
    roleDescriptions: {
      admin: 'Full system administration: approve, dispatch, view all data and switch role perspectives',
      employee: 'Create vehicle requests and track management approval status',
      manager: 'Review, approve or reject team members\' vehicle requests',
      dispatcher: 'Assign fleet vehicles & drivers, coordinate daily trips',
      driver: 'Receive trip orders, report ODO readings and trip completion',
    },

    // Navigation Tabs
    navBookings: 'Trip Bookings',
    navTimeline: 'Fleet Schedule',
    navFleet: 'Fleet & Drivers',
    navAnalytics: 'Analytics & Reports',

    // Actions & Buttons
    newBooking: 'New Booking',
    connectSheets: 'Connect Sheets',
    googleSheets: 'Google Sheets',
    quickSync: 'Sync to Sheets',
    pullFromSheets: 'Pull from Sheets',
    refreshFromSheets: 'Refresh from Sheets',
    syncing: 'Syncing...',
    readingSheets: 'Reading Sheets...',
    routeEstimator: 'Route Calculator',
    clearLocalData: 'Clear Cache',
    viewGoogleSheet: 'Open Google Sheet',
    logout: 'Log Out',
    loginGoogle: 'Sign in with Google',
    loginWithGoogle: 'Sign in with Google',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    close: 'Close',
    search: 'Search',
    all: 'All',
    filter: 'Filter',
    viewTable: 'Table View',
    viewGrid: 'Grid View',
    actions: 'Actions',

    // Filter & Search
    searchPlaceholder: 'Search by booking code, requester, license plate, destination...',
    allStatuses: 'All Statuses',
    allDepartments: 'All Departments',
    allVehicleTypes: 'All Categories',
    allFuelTypes: 'All Fuel Types',

    // Statuses
    bookingStatus: {
      pending_manager: 'Pending Manager Approval',
      pending_dispatch: 'Pending Dispatch',
      assigned: 'Vehicle & Driver Assigned',
      in_progress: 'In Progress',
      completed: 'Completed',
      rejected: 'Rejected',
      cancelled: 'Cancelled',
    },
    vehicleStatus: {
      available: 'Available',
      in_use: 'In Use',
      maintenance: 'Maintenance',
    },
    vehicleType: {
      sedan_4: 'Sedan 4-5 Seats',
      suv_7: 'SUV/Crossover 7 Seats',
      van_16: '16-Seat Van',
      pickup: 'Pickup Truck',
    },
    tripType: {
      'one-way': 'One-way',
      'round-trip': 'Round-trip',
    },
    fuelType: {
      electric: 'Electric (EV)',
      gasoline: 'Gasoline',
      diesel: 'Diesel',
    },

    // Fleet Table Columns
    colVehicleCode: 'Vehicle Code',
    colPlateNumber: 'License Plate',
    colModel: 'Model',
    colCategory: 'Category',
    colSeats: 'Seats',
    colFuel: 'Fuel',
    colOdo: 'Odometer (ODO)',
    colStatus: 'Status',
    colActions: 'Actions',

    // Fleet KPIs
    kpiTotalFleet: 'Total Fleet',
    kpiAvailable: 'Available',
    kpiInUse: 'In Service',
    kpiMaintenance: 'Maintenance',
    kpiTotalVehicles: 'Total vehicles',
    kpiVehiclesUnit: 'vehicles',

    // Fleet UI & Drivers
    fleetTabVehicles: 'Company Fleet',
    fleetTabDrivers: 'Company Drivers',
    addVehicle: 'Add New Vehicle',
    addDriver: 'Add New Driver',
    primaryDriver: 'Lead Driver',
    changeStatus: 'Vehicle Status',
    statusAvailable: 'Available',
    statusInUse: 'In Use',
    statusMaintenance: 'Maintenance',
    noVehiclesTitle: 'No vehicles found in fleet',
    noVehiclesDesc: 'The list is currently empty. Click "Refresh from Sheets" to load tab "Đội Xe Công Ty" from Google Sheets, or add a new vehicle manually.',
    noDriversTitle: 'No drivers found',
    noDriversDesc: 'Driver roster is currently empty. Add company drivers or load them from Google Sheets.',
    driverLicense: 'Driver License',
    driverExperience: 'Experience',
    driverRating: 'Rating',
    driverAssignedTo: 'Assigned Vehicle',
    driverStatusActive: 'Available for trips',
    driverStatusBusy: 'On Trip',
    driverStatusOff: 'Off Duty',
    years: 'years',

    // Bookings list
    noBookingsTitle: 'No trip bookings yet',
    noBookingsDesc: 'Mock data has been cleared. Real records from your Google Sheet or new bookings will appear here.',
    firstBookingCta: 'Create First Booking',
    bookingCode: 'Booking Code',
    requester: 'Requester',
    department: 'Department',
    phone: 'Phone',
    purpose: 'Purpose',
    route: 'Route',
    pickupPoint: 'Pickup',
    destinationPoint: 'Destination',
    departureTime: 'Departure',
    returnTime: 'Return',
    passengers: 'Passengers',
    distanceKm: 'Est. Distance',
    assignedVehicle: 'Assigned Car',
    assignedDriver: 'Driver',
    notAssigned: 'Not assigned yet',
    notes: 'Notes',
    syncedBadge: 'Synced to Sheets',
    unSyncedBadge: 'Not Synced',

    // Booking Card Actions
    btnApprove: 'Approve',
    btnReject: 'Reject',
    btnDispatch: 'Assign Vehicle & Driver',
    btnStartTrip: 'Start Trip',
    btnCompleteTrip: 'Complete Trip',
    btnCancelTrip: 'Cancel Request',
    btnSyncToSheet: 'Sync to Sheets',

    // Modals
    modalBookingTitle: 'Request Business Vehicle',
    modalDispatchTitle: 'Vehicle & Driver Dispatch',
    modalCompleteTitle: 'Complete Business Trip',
    modalSheetsTitle: 'Google Sheets Integration & Sync',
    modalRouteTitle: 'Route Distance & Fuel Estimator',
    modalAddVehicleTitle: 'Add Vehicle to Fleet',
    modalAddDriverTitle: 'Add Driver to Roster',

    // Timeline
    timelineTitle: 'Visual Fleet Dispatch Schedule',
    timelineSubtitle: 'Monitor live vehicle occupancy, assignments and timeline',
    timelineToday: 'Today',
    timelineVehicleColumn: 'Fleet Vehicle',
    timelineNoTrips: 'No trips scheduled for this date',

    // Analytics
    analyticsTitle: 'Fleet Reports & Analytics',
    analyticsSubtitle: 'Summary of mileage, fuel expenses, toll fees and dispatch performance',
    totalTrips: 'Total Trips',
    completedTrips: 'Completed Trips',
    totalDistance: 'Total Distance',
    totalTollFee: 'Total Toll Fees',
    totalFuelCost: 'Total Fuel Expenses',
    tripsByDepartment: 'Trips by Department',
    vehicleUtilization: 'Vehicle Utilization Rate',

    // Feedback Messages
    syncSuccess: '✓ All records successfully synced to Google Sheets!',
    syncFailed: '⚠️ Sync failed: ',
    refreshSuccess: '✓ Successfully refreshed latest data from Google Sheets!',
    refreshFailed: '⚠️ Error pulling from Google Sheets: ',
    clearSuccess: '✓ Cleared local temporary data back to empty list.',
    approvedSuccess: '✓ Booking request approved.',
    rejectedSuccess: '✓ Booking request rejected.',
    dispatchedSuccess: '✓ Vehicle and driver assigned successfully.',
    startedSuccess: '✓ Trip is now in progress.',
    completedSuccess: '✓ Trip completed and record saved.',
    cancelledSuccess: '✓ Booking request cancelled.',
    bookingCreatedSuccess: '✓ Booking request submitted successfully.',
  },
};
