/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Car,
  FileSpreadsheet,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Plus,
  Compass,
  TrendingUp,
  Users,
  ShieldAlert,
  Info,
  Download,
  Trash2,
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

import {
  Booking,
  Vehicle,
  Driver,
  UserRole,
  NumericRole,
  UserProfile,
  SheetUser,
  ROLE_EMPLOYEE,
  ROLE_MANAGER,
  ROLE_DISPATCHER,
  ROLE_DRIVER,
  ROLE_MAP,
  ROLE_FROM_STRING,
  SheetsConfig,
  BookingStatus,
  VehicleStatus,
} from './types/fleet';
import {
  INITIAL_BOOKINGS,
  INITIAL_VEHICLES,
  INITIAL_DRIVERS,
  DEPARTMENTS,
  DEFAULT_PROFILES,
} from './data/mockData';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  setCachedAccessToken,
} from './services/auth';
import {
  appendBookingToSheet,
  syncAllToSheets,
  loadAllFromSheets,
  lookupUserInSheet,
  fetchUsersFromSheet,
  STATUS_LABELS,
} from './services/sheetsService';

import { Navbar } from './components/Navbar';
import { BookingCard } from './components/BookingCard';
import { BookingDetailModal } from './components/BookingDetailModal';
import { BookingModal } from './components/BookingModal';
import { DispatchModal } from './components/DispatchModal';
import { CompleteTripModal } from './components/CompleteTripModal';
import { FleetScheduleTimeline } from './components/FleetScheduleTimeline';
import { FleetList } from './components/FleetList';
import { AnalyticsView } from './components/AnalyticsView';
import { SheetsSyncModal } from './components/SheetsSyncModal';
import { RouteEstimatorModal } from './components/RouteEstimatorModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { useLanguage } from './i18n/LanguageContext';

export default function App() {
  const { lang, t, getRoleLabel } = useLanguage();

  // Purge legacy mock data cache once on app initialization
  useEffect(() => {
    try {
      const legacyBookings = localStorage.getItem('autofleet_bookings');
      if (legacyBookings && (legacyBookings.includes('bk_001') || legacyBookings.includes('Sun Group'))) {
        localStorage.removeItem('autofleet_bookings');
        localStorage.removeItem('autofleet_vehicles');
        localStorage.removeItem('autofleet_drivers');
      }
    } catch {
      // ignore
    }
  }, []);

  // Core Data States - Defaulting to empty arrays (no mock data)
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem('autofleet_v2_bookings');
      return saved ? JSON.parse(saved) : INITIAL_BOOKINGS; // []
    } catch {
      return [];
    }
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const saved = localStorage.getItem('autofleet_v2_vehicles');
      return saved ? JSON.parse(saved) : INITIAL_VEHICLES; // []
    } catch {
      return [];
    }
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    try {
      const saved = localStorage.getItem('autofleet_v2_drivers');
      return saved ? JSON.parse(saved) : INITIAL_DRIVERS; // []
    } catch {
      return [];
    }
  });

  // Danh sách phòng ban (tự động đọc từ tab 'DS Phòng Ban' cột B trong Google Sheets)
  const [departments, setDepartments] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('autofleet_departments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEPARTMENTS;
  });

  // 1. Quản lý trạng thái Vai trò (Role State):
  // Admin = 0, Nhân viên = 1, Trưởng bộ phận = 2, Điều phối xe = 3, Tài xế = 4
  const [role, setRole] = useState<NumericRole>(() => {
    try {
      const saved = localStorage.getItem('autofleet_user_numeric_role');
      if (saved && ['0', '1', '2', '3', '4'].includes(saved)) {
        return parseInt(saved, 10) as NumericRole;
      }
    } catch {
      // ignore
    }
    return ROLE_EMPLOYEE; // Default: 1
  });

  // Track if current authenticated user has Admin role (from DS User sheet or admin session)
  const [isAdminAccount, setIsAdminAccount] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('autofleet_is_admin_account');
      if (saved === 'true') return true;
      const savedRole = localStorage.getItem('autofleet_user_numeric_role');
      if (savedRole === '0') return true;
    } catch {}
    return false;
  });

  // Thông tin user hiện tại (Persona thử nghiệm theo từng role hoặc lấy từ Google Auth)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('autofleet_current_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PROFILES[ROLE_EMPLOYEE];
  });

  // DS User data from Google Sheets ('DS User' tab)
  const [sheetUsers, setSheetUsers] = useState<SheetUser[]>(() => {
    try {
      const saved = localStorage.getItem('autofleet_sheet_users');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [isRoleFromSheet, setIsRoleFromSheet] = useState<boolean>(() => {
    return localStorage.getItem('autofleet_role_from_sheet') === 'true';
  });

  // Automatically sync user role and department from 'DS User' tab
  const applyUserFromSheet = (userEmail: string, usersList: SheetUser[]) => {
    if (!userEmail) return false;
    const cleanEmail = userEmail.trim().toLowerCase();
    const matched = usersList.find((u) => u.email.trim().toLowerCase() === cleanEmail);

    if (matched) {
      const isUserAdmin =
        matched.numericRole === 0 ||
        matched.roleStr.trim().toLowerCase() === 'admin' ||
        matched.isAdmin === true;

      setIsAdminAccount(isUserAdmin);
      localStorage.setItem('autofleet_is_admin_account', isUserAdmin ? 'true' : 'false');

      setRole(matched.numericRole);
      localStorage.setItem('autofleet_user_numeric_role', String(matched.numericRole));

      const updatedProfile: UserProfile = {
        id: `usr_${matched.email}`,
        name: matched.name || user?.displayName || 'Người dùng',
        email: matched.email,
        phone: currentUser.phone || '',
        role: matched.numericRole,
        department: matched.department || '',
        isAdmin: isUserAdmin,
      };

      setCurrentUser(updatedProfile);
      localStorage.setItem('autofleet_current_user', JSON.stringify(updatedProfile));
      setIsRoleFromSheet(true);
      localStorage.setItem('autofleet_role_from_sheet', 'true');

      const roleLabel = isUserAdmin
        ? (lang === 'vi' ? 'Quản Trị Viên (Admin)' : 'Administrator (Admin)')
        : getRoleLabel(ROLE_MAP[matched.numericRole]);
      const deptLabel = matched.department ? ` - ${matched.department}` : '';
      setSyncFeedback(
        lang === 'vi'
          ? `✓ Phân quyền tự động từ 'DS User': ${matched.name} (${roleLabel}${deptLabel})`
          : `✓ Role assigned from 'DS User': ${matched.name} (${roleLabel}${deptLabel})`
      );
      setTimeout(() => setSyncFeedback(null), 5000);
      return true;
    } else {
      setIsRoleFromSheet(false);
      localStorage.setItem('autofleet_role_from_sheet', 'false');
      return false;
    }
  };

  // String role alias for translations & backwards compatibility
  const currentRoleString: UserRole = ROLE_MAP[role] || 'employee';

  const [activeTab, setActiveTab] = useState<'bookings' | 'timeline' | 'fleet' | 'analytics'>(
    'bookings'
  );

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Google Auth & Sheets States
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const [sheetsConfig, setSheetsConfig] = useState<SheetsConfig>(() => {
    const saved = localStorage.getItem('autofleet_sheets_config');
    return saved
      ? JSON.parse(saved)
      : {
          spreadsheetId: null,
          spreadsheetTitle: 'Sổ Quản Lý Đặt Xe Nội Bộ',
          spreadsheetUrl: null,
          sheetName: 'Danh Sách Đặt Xe',
          autoSync: true,
          lastSyncTime: null,
        };
  });

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isRouteEstimatorOpen, setIsRouteEstimatorOpen] = useState(false);
  const [dispatchBooking, setDispatchBooking] = useState<Booking | null>(null);
  const [completeBooking, setCompleteBooking] = useState<Booking | null>(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<Booking | null>(null);

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    details?: string[];
    isDestructive: boolean;
    action: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    isDestructive: false,
    action: () => {},
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('autofleet_v2_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('autofleet_v2_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('autofleet_v2_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('autofleet_sheets_config', JSON.stringify(sheetsConfig));
  }, [sheetsConfig]);

  // Auth initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        if (token) {
          setAccessToken(token);
        }
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        setSyncFeedback(`Đã đăng nhập Google thành công: ${result.user.email}`);

        // Immediately attempt user lookup in 'DS User'
        if (result.user.email) {
          if (sheetUsers.length > 0) {
            applyUserFromSheet(result.user.email, sheetUsers);
          } else if (sheetsConfig.spreadsheetId) {
            lookupUserInSheet(result.accessToken, sheetsConfig.spreadsheetId, result.user.email)
              .then((matched) => {
                if (matched) {
                  applyUserFromSheet(result.user.email!, [matched]);
                } else {
                  setIsRoleFromSheet(false);
                  localStorage.setItem('autofleet_role_from_sheet', 'false');
                }
              })
              .catch(console.error);
          }
        }

        setTimeout(() => setSyncFeedback(null), 4000);
      }
    } catch (err: any) {
      console.error('Đăng nhập thất bại:', err);
      alert('Đăng nhập Google thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setIsRoleFromSheet(false);
    localStorage.removeItem('autofleet_role_from_sheet');
    setIsAdminAccount(false);
    localStorage.removeItem('autofleet_is_admin_account');
  };

  // Pull / Read all data from Google Sheets (If empty, displays empty list)
  const handlePullFromSheets = async () => {
    if (!accessToken) {
      handleGoogleSignIn();
      return;
    }
    if (!sheetsConfig.spreadsheetId) {
      setIsSheetsModalOpen(true);
      return;
    }

    setIsSyncing(true);
    setSyncFeedback(t.readingSheets);
    try {
      const loaded = await loadAllFromSheets(accessToken, sheetsConfig.spreadsheetId);
      setBookings(loaded.bookings);
      setVehicles(loaded.vehicles);
      setDrivers(loaded.drivers);
      if (loaded.departments && loaded.departments.length > 0) {
        setDepartments(loaded.departments);
        localStorage.setItem('autofleet_departments', JSON.stringify(loaded.departments));
      }
      if (loaded.users && loaded.users.length > 0) {
        setSheetUsers(loaded.users);
        localStorage.setItem('autofleet_sheet_users', JSON.stringify(loaded.users));
        const emailToCheck = user?.email || currentUser.email;
        if (emailToCheck) {
          applyUserFromSheet(emailToCheck, loaded.users);
        }
      }
      setSheetsConfig((prev) => ({
        ...prev,
        lastSyncTime: new Date().toISOString(),
      }));
      const deptInfo =
        loaded.departments && loaded.departments.length > 0
          ? lang === 'vi'
            ? `, ${loaded.departments.length} phòng ban`
            : `, ${loaded.departments.length} departments`
          : '';
      const userInfo =
        loaded.users && loaded.users.length > 0
          ? lang === 'vi'
            ? `, ${loaded.users.length} tài khoản (tab 'DS User')`
            : `, ${loaded.users.length} users (tab 'DS User')`
          : '';
      setSyncFeedback(
        lang === 'vi'
          ? `✓ Đã làm mới từ Google Sheets: Cập nhật ${loaded.vehicles.length} phương tiện, ${loaded.drivers.length} tài xế, ${loaded.bookings.length} phiếu đặt xe${deptInfo}${userInfo}!`
          : `✓ Refreshed from Google Sheets: ${loaded.vehicles.length} vehicles, ${loaded.drivers.length} drivers, ${loaded.bookings.length} trips${deptInfo}${userInfo}!`
      );
      setTimeout(() => setSyncFeedback(null), 5000);
    } catch (err: any) {
      console.error('Lỗi khi đọc Google Sheets:', err);
      setSyncFeedback(t.refreshFailed + ': ' + (err.message || ''));
      setTimeout(() => setSyncFeedback(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Automatically sync user role whenever Google user or sheet users list updates
  useEffect(() => {
    if (user?.email && sheetUsers.length > 0) {
      applyUserFromSheet(user.email, sheetUsers);
    }
  }, [user?.email, sheetUsers]);

  // Automatically refresh fleet & bookings whenever user signs in or connects sheet
  useEffect(() => {
    if (accessToken && sheetsConfig.spreadsheetId) {
      handlePullFromSheets();
    }
  }, [accessToken, sheetsConfig.spreadsheetId]);

  // Clear local temporary data back to completely empty
  const handleClearLocalData = () => {
    setBookings([]);
    setVehicles([]);
    setDrivers([]);
    localStorage.removeItem('autofleet_v2_bookings');
    localStorage.removeItem('autofleet_v2_vehicles');
    localStorage.removeItem('autofleet_v2_drivers');
    localStorage.removeItem('autofleet_bookings');
    localStorage.removeItem('autofleet_vehicles');
    localStorage.removeItem('autofleet_drivers');
    setSyncFeedback(t.clearSuccess);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  // Quick Sync all current bookings, vehicles, drivers to Google Sheets
  const handleQuickSync = async () => {
    if (!accessToken) {
      handleGoogleSignIn();
      return;
    }
    if (!sheetsConfig.spreadsheetId) {
      setIsSheetsModalOpen(true);
      return;
    }

    setIsSyncing(true);
    setSyncFeedback(t.syncing);
    try {
      await syncAllToSheets(
        accessToken,
        sheetsConfig.spreadsheetId,
        bookings,
        vehicles,
        drivers
      );
      setSheetsConfig((prev) => ({
        ...prev,
        lastSyncTime: new Date().toISOString(),
      }));
      setSyncFeedback(t.syncSuccess);
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (err: any) {
      console.error('Lỗi khi đồng bộ Google Sheets:', err);
      setSyncFeedback(t.syncFailed + ': ' + (err.message || ''));
      setTimeout(() => setSyncFeedback(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync single booking to Google Sheets
  const handleSyncSingleToSheets = async (booking: Booking) => {
    if (!accessToken) {
      handleGoogleSignIn();
      return;
    }
    if (!sheetsConfig.spreadsheetId) {
      setIsSheetsModalOpen(true);
      return;
    }

    const veh = vehicles.find((v) => v.id === booking.assignedVehicleId);
    const drv = drivers.find((d) => d.id === booking.assignedDriverId);

    setIsSyncing(true);
    try {
      const success = await appendBookingToSheet(
        accessToken,
        sheetsConfig.spreadsheetId,
        booking,
        veh,
        drv
      );
      if (success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === booking.id ? { ...b, syncedToSheets: true } : b))
        );
        setSyncFeedback(
          lang === 'vi'
            ? `✓ Đã ghi phiếu ${booking.code} vào Google Sheets!`
            : `✓ Saved booking ${booking.code} to Google Sheets!`
        );
        setTimeout(() => setSyncFeedback(null), 3500);
      }
    } catch (err: any) {
      console.error(err);
      setSyncFeedback(
        lang === 'vi' ? '⚠️ Không thể ghi phiếu vào Google Sheets.' : '⚠️ Failed to save booking to Google Sheets.'
      );
      setTimeout(() => setSyncFeedback(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  // 1. Submit New Booking
  const handleCreateBooking = async (newFields: Partial<Booking>) => {
    const nextCodeNumber = bookings.length + 1;
    const code = `BK-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(nextCodeNumber).padStart(3, '0')}`;

    const newBooking: Booking = {
      id: `bk_${Date.now()}`,
      code,
      requesterName: newFields.requesterName || 'Cán bộ nhân viên',
      requesterEmail: newFields.requesterEmail || user?.email || '',
      requesterPhone: newFields.requesterPhone || '',
      department: newFields.department || DEPARTMENTS[0],
      purpose: newFields.purpose || 'Đi công tác công ty',
      pickupLocation: newFields.pickupLocation || '',
      destination: newFields.destination || '',
      departureTime: newFields.departureTime || new Date().toISOString(),
      returnTime: newFields.returnTime,
      tripType: newFields.tripType || 'round-trip',
      vehicleTypeNeeded: newFields.vehicleTypeNeeded || 'suv_7',
      passengerCount: newFields.passengerCount || 1,
      passengerList: newFields.passengerList || [],
      priority: newFields.priority || 'normal',
      status: 'pending_manager', // Initial state
      notes: newFields.notes,
      specialRequirements: newFields.specialRequirements,
      estimatedDistanceKm: newFields.estimatedDistanceKm || 20,
      estimatedDurationMin: newFields.estimatedDurationMin || 45,
      syncedToSheets: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // 1. GHI THẲNG LÊN GOOGLE SHEETS NGAY KHI TẠO PHIẾU
try {
  if (spreadsheetId && accessToken) {
    await appendBookingToSheet(accessToken, spreadsheetId, newBooking);
  }
} catch (error) {
  console.error("Lỗi đồng bộ lên Google Sheets:", error);
}
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Auto-sync to Google Sheets if connected
    if (accessToken && sheetsConfig.spreadsheetId && sheetsConfig.autoSync) {
      appendBookingToSheet(accessToken, sheetsConfig.spreadsheetId, newBooking)
        .then((ok) => {
          if (ok) {
            setBookings((prev) =>
              prev.map((b) => (b.id === newBooking.id ? { ...b, syncedToSheets: true } : b))
            );
          }
        })
        .catch(console.error);
    }

    setSyncFeedback(
      lang === 'vi'
        ? `✓ Đã tạo phiếu đăng ký ${code} thành công!`
        : `✓ Booking request ${code} created successfully!`
    );
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  // 2. Manager Approval
  const handleApproveByManager = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'pending_dispatch',
              managerApprovedAt: new Date().toISOString(),
              managerApprovedBy: user?.displayName || (lang === 'vi' ? 'Trưởng Phòng Phê Duyệt' : 'Department Manager'),
              updatedAt: new Date().toISOString(),
            }
          : b
      )
    );
    setSyncFeedback(t.approvedSuccess);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  // 3. Manager Rejection
  const handleRejectByManager = (bookingId: string) => {
    setConfirmModal({
      isOpen: true,
      title: lang === 'vi' ? 'Từ chối yêu cầu đặt xe' : 'Reject Booking Request',
      message:
        lang === 'vi'
          ? 'Bạn có chắc chắn muốn từ chối yêu cầu đặt xe này không?'
          : 'Are you sure you want to reject this booking request?',
      isDestructive: true,
      action: () => {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  status: 'rejected',
                  rejectionReason:
                    lang === 'vi' ? 'Từ chối bởi Quản lý bộ phận' : 'Rejected by Department Manager',
                  updatedAt: new Date().toISOString(),
                }
              : b
          )
        );
        setSyncFeedback(t.rejectedSuccess);
        setTimeout(() => setSyncFeedback(null), 4000);
      },
    });
  };

  // 4. Dispatcher Assignment (Vehicle & Driver)
  const handleConfirmDispatch = (
    bookingId: string,
    vehicleId: string,
    driverId: string,
    notes?: string
  ) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'assigned',
              assignedVehicleId: vehicleId,
              assignedDriverId: driverId,
              notes: notes
                ? `${b.notes ? b.notes + ' | ' : ''}${lang === 'vi' ? 'Điều phối: ' : 'Dispatch: '}${notes}`
                : b.notes,
              dispatchedAt: new Date().toISOString(),
              dispatchedBy: user?.displayName || (lang === 'vi' ? 'Điều Phối Xe VP' : 'Fleet Dispatcher'),
              updatedAt: new Date().toISOString(),
            }
          : b
      )
    );

    // Update vehicle & driver status
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, status: 'in_use' } : v))
    );
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, status: 'busy', currentVehicleId: vehicleId } : d))
    );

    setSyncFeedback(t.dispatchedSuccess);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  // 5. Driver Starts Trip
  const handleStartTrip = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'in_progress',
              startedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : b
      )
    );
    setSyncFeedback(t.startedSuccess);
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  // 6. Complete Trip & Handover
  const handleConfirmComplete = (
    bookingId: string,
    actualKm: number,
    tollFee: number,
    fuelCost: number,
    driverNotes?: string
  ) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'completed',
              actualDistanceKm: actualKm,
              tollFee,
              fuelCost,
              driverNotes,
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : b
      )
    );

    // Free up vehicle & driver
    if (booking.assignedVehicleId) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === booking.assignedVehicleId
            ? {
                ...v,
                status: 'available',
                currentMileage: v.currentMileage + actualKm,
              }
            : v
        )
      );
    }

    if (booking.assignedDriverId) {
      setDrivers((prev) =>
        prev.map((d) => (d.id === booking.assignedDriverId ? { ...d, status: 'active' } : d))
      );
    }

    setSyncFeedback(t.completedSuccess);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  // 7. Cancel Booking
  const handleCancelBooking = (bookingId: string) => {
    setConfirmModal({
      isOpen: true,
      title: lang === 'vi' ? 'Hủy phiếu đặt xe' : 'Cancel Vehicle Booking',
      message:
        lang === 'vi'
          ? 'Bạn có chắc chắn muốn hủy phiếu đăng ký đặt xe này không?'
          : 'Are you sure you want to cancel this vehicle booking request?',
      isDestructive: true,
      action: () => {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
        );
        setSyncFeedback(t.cancelledSuccess);
        setTimeout(() => setSyncFeedback(null), 3000);
      },
    });
  };

  // 8. Vehicle & Driver Management Handlers
  const handleAddVehicle = (newVeh: Vehicle) => {
    setVehicles((prev) => [newVeh, ...prev]);
    setSyncFeedback(
      lang === 'vi'
        ? `✓ Đã thêm xe ${newVeh.model} (${newVeh.plateNumber}) vào đội xe!`
        : `✓ Added vehicle ${newVeh.model} (${newVeh.plateNumber}) to fleet!`
    );
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  const handleUpdateVehicleStatus = (vehicleId: string, status: VehicleStatus) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, status } : v))
    );
  };

  const handleAddDriver = (newDrv: Driver) => {
    setDrivers((prev) => [newDrv, ...prev]);
    setSyncFeedback(
      lang === 'vi'
        ? `✓ Đã thêm tài xế ${newDrv.name} vào hệ thống!`
        : `✓ Added driver ${newDrv.name} to the system!`
    );
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  // Switch role and update user persona for dev & testing (view mode for Admin)
  const handleRoleChange = (newRole: NumericRole) => {
    setRole(newRole);
    localStorage.setItem('autofleet_user_numeric_role', String(newRole));

    const baseProfile = DEFAULT_PROFILES[newRole];
    const isCurrentlyAdmin = isAdminAccount || newRole === 0;
    const updatedUser: UserProfile = {
      ...baseProfile,
      name: user?.displayName || baseProfile.name,
      email: user?.email || baseProfile.email,
      department: currentUser.department || baseProfile.department,
      isAdmin: isCurrentlyAdmin,
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('autofleet_current_user', JSON.stringify(updatedUser));
  };

  // Keep selectedBookingDetail fresh when bookings list updates
  useEffect(() => {
    if (selectedBookingDetail) {
      const fresh = bookings.find((b) => b.id === selectedBookingDetail.id);
      if (fresh) setSelectedBookingDetail(fresh);
    }
  }, [bookings]);

  // 2. Phân quyền hiển thị Giao diện (Frontend View Tab Gating):
  // Nếu role = 0: Toàn quyền truy cập tất cả 4 tab, không bị chuyển tab
  // Nếu role = 1: Ẩn 'fleet' & 'analytics'
  // Nếu role = 2: Ẩn 'fleet', hiện 'analytics'
  // Nếu role = 3: Hiện đầy đủ tất cả
  // Nếu role = 4: Chỉ hiển thị 'timeline'
  useEffect(() => {
    if (role === 0) {
      // Admin: Cho phép truy cập mọi tab, không redirect
      return;
    }
    if (role === 4) {
      if (activeTab !== 'timeline') {
        setActiveTab('timeline');
      }
    } else if (role === 1 && (activeTab === 'fleet' || activeTab === 'analytics')) {
      setActiveTab('bookings');
    } else if (role === 2 && activeTab === 'fleet') {
      setActiveTab('bookings');
    }
  }, [role, activeTab]);

  // Nút "+ Đăng Ký Đặt Xe": Hiển thị cho Admin (0), Nhân viên (1) và Trưởng bộ phận (2). Ẩn với Điều phối (3) và Tài xế (4).
  const canCreateBooking = role === 0 || role === 1 || role === 2;

  // 3. Phân quyền dữ liệu (Data Filtering):
  const roleFilteredBookings = bookings.filter((b) => {
    if (role === 0) {
      // Admin: Hiển thị toàn bộ dữ liệu, không áp dụng bất kỳ bộ lọc ẩn dữ liệu nào
      // Admin sẽ thấy tất cả các phiếu đặt xe của mọi nhân viên, mọi phòng ban và tất cả lịch trình của tài xế.
      return true;
    }

    if (role === 1) {
      // Nhân viên: Chỉ hiển thị trong bảng/danh sách những phiếu đặt xe do chính họ tạo (Lọc dữ liệu theo email người yêu cầu trùng với email đăng nhập)
      const loggedEmail = (user?.email || currentUser.email || '').trim().toLowerCase();
      const bEmail = (b.requesterEmail || '').trim().toLowerCase();
      const userName = (currentUser.name || user?.displayName || '').trim().toLowerCase();
      const bName = (b.requesterName || '').trim().toLowerCase();

      if (loggedEmail && bEmail) {
        return bEmail === loggedEmail;
      }
      if (loggedEmail && !bEmail && userName && bName) {
        return bName === userName;
      }
      return bEmail === loggedEmail || (userName && bName === userName);
    }

    if (role === 2) {
      // Trưởng bộ phận: Chỉ hiển thị những phiếu thuộc phòng ban của họ cần phê duyệt (Lọc dữ liệu theo phòng ban)
      const mgrDept = (currentUser.department || '').trim().toLowerCase();
      const bDept = (b.department || '').trim().toLowerCase();
      if (!mgrDept) return true;
      return bDept === mgrDept;
    }

    if (role === 3) {
      // Điều phối xe: Hiển thị toàn bộ dữ liệu phiếu đặt xe để xử lý, xếp xe và tài xế
      return true;
    }

    if (role === 4) {
      // Tài xế: Chỉ hiển thị lịch trình các chuyến đi mà họ được chỉ định lái
      const drvId = currentUser.driverId;
      const drvName = currentUser.name.trim().toLowerCase();
      if (drvId && b.assignedDriverId === drvId) return true;
      const assignedDrv = drivers.find((d) => d.id === b.assignedDriverId);
      if (assignedDrv && assignedDrv.name.trim().toLowerCase() === drvName) return true;
      if (b.notes?.toLowerCase().includes(drvName)) return true;
      return false;
    }

    return true;
  });

  // Số lượng phiếu chờ duyệt: Admin thấy tất cả phiếu pending_manager, Trưởng phòng (Role 2) thấy phiếu phòng mình
  const pendingManagerCount = bookings.filter(
    (b) =>
      b.status === 'pending_manager' &&
      (role === 0 || (currentUser.department && b.department.trim().toLowerCase() === currentUser.department.trim().toLowerCase()))
  ).length;

  // Filter Bookings by Search, Status, and Department
  const filteredBookings = roleFilteredBookings.filter((b) => {
    // Search
    const matchesSearch =
      b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Status Filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending' && b.status !== 'pending_manager' && b.status !== 'pending_dispatch') {
        return false;
      } else if (statusFilter !== 'pending' && b.status !== statusFilter) {
        return false;
      }
    }

    // Department Filter (Cho phép lọc thêm nếu không phải role 1 hoặc 2)
    if (departmentFilter !== 'all' && b.department !== departmentFilter) {
      return false;
    }

    return true;
  });

  // Dynamic Navigation Tabs list based on Active Role
  const availableTabs = [
    // Tab 1: Phiếu Đặt Xe (Hiện cho Role 0, 1, 2, 3 - Ẩn cho Role 4)
    ...(role === 0 || role === 1 || role === 2 || role === 3
      ? [
          {
            id: 'bookings' as const,
            label: t.navBookings,
            icon: Car,
            count: roleFilteredBookings.length,
          },
        ]
      : []),
    // Tab 2: Lịch Trình Đội Xe (Hiện cho tất cả các role, đặc biệt Role 4 chỉ thấy tab này)
    {
      id: 'timeline' as const,
      label: t.navTimeline,
      icon: Clock,
      count: null,
    },
    // Tab 3: Quản Lý Đội Xe & Tài Xế (Hiện cho Role 0: Admin và Role 3: Điều phối xe)
    ...(role === 0 || role === 3
      ? [
          {
            id: 'fleet' as const,
            label: t.navFleet,
            icon: Users,
            count: vehicles.length,
          },
        ]
      : []),
    // Tab 4: Báo Cáo & Thống Kê (Hiện cho Role 0: Admin, Role 2: Trưởng bộ phận và Role 3: Điều phối xe)
    ...(role === 0 || role === 2 || role === 3
      ? [
          {
            id: 'analytics' as const,
            label: t.navAnalytics,
            icon: TrendingUp,
            count: null,
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar with User Role Badge and Admin View Switcher */}
      <Navbar
        currentRole={role}
        onChangeRole={handleRoleChange}
        currentUser={currentUser}
        sheetsConfig={sheetsConfig}
        isRoleFromSheet={isRoleFromSheet}
        isAdmin={isAdminAccount || role === 0}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onOpenBookingModal={() => setIsBookingModalOpen(true)}
        onOpenRouteEstimator={() => setIsRouteEstimatorOpen(true)}
        user={user}
        onGoogleSignIn={handleGoogleSignIn}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        onQuickSync={handleQuickSync}
        onPullFromSheets={handlePullFromSheets}
        isSyncing={isSyncing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Feedback / Notification Toast */}
        {syncFeedback && (
          <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between animate-fade-in border border-slate-700">
            <div className="flex items-center space-x-2.5 text-xs font-semibold">
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{syncFeedback}</span>
            </div>
            {sheetsConfig.spreadsheetUrl && (
              <a
                href={sheetsConfig.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline ml-4"
              >
                <span>{t.viewGoogleSheet}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* User Role Authorization Status Banner (Synced from DS User) */}
        {user && isRoleFromSheet && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                {role === 0 ? '👑' : role === 1 ? '👤' : role === 2 ? '👔' : role === 3 ? '📋' : '🚗'}
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-emerald-950">
                    {lang === 'vi' ? 'Phân quyền tự động từ' : 'Auto-authorized from'}
                  </span>
                  <span className="font-mono font-bold text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-300">
                    tab: DS User
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="font-extrabold text-emerald-900">
                    {currentUser.name} ({user.email})
                  </span>
                  {(isAdminAccount || role === 0) && (
                    <span className="font-extrabold text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-300 flex items-center gap-1">
                      👑 Admin
                    </span>
                  )}
                </div>
                <p className="text-emerald-800 mt-0.5">
                  {lang === 'vi'
                    ? `Vai trò: ${role === 0 ? 'Quản Trị Viên (Admin)' : getRoleLabel(ROLE_MAP[role])} | Phòng ban: ${currentUser.department || (role === 0 ? 'Ban Quản Trị' : 'Chưa gán')}`
                    : `Role: ${role === 0 ? 'Administrator (Admin)' : getRoleLabel(ROLE_MAP[role])} | Department: ${currentUser.department || (role === 0 ? 'Admin Office' : 'Unassigned')}`}
                  {role === 0 && (
                    <span className="text-amber-800 font-bold ml-1">
                      {lang === 'vi'
                        ? '• Toàn quyền quản trị hệ thống: Thấy toàn bộ phiếu, xe, tài xế & có thanh đổi góc nhìn'
                        : '• Full Admin privileges: View all bookings, vehicles, drivers & rapid view switcher'}
                    </span>
                  )}
                  {role === 1 && (
                    <span className="text-emerald-700 ml-1">
                      {lang === 'vi'
                        ? '• Chỉ hiển thị các phiếu do chính bạn tạo'
                        : '• Only showing requests created by your account'}
                    </span>
                  )}
                  {role === 2 && (
                    <span className="text-emerald-700 ml-1">
                      {lang === 'vi'
                        ? `• Chỉ hiển thị & duyệt các phiếu thuộc ${currentUser.department}`
                        : `• Only showing & approving requests from ${currentUser.department}`}
                    </span>
                  )}
                  {role === 3 && (
                    <span className="text-emerald-700 ml-1">
                      {lang === 'vi'
                        ? '• Toàn quyền quản trị & điều phối tất cả các phiếu'
                        : '• Full access & dispatch management'}
                    </span>
                  )}
                </p>
              </div>
            </div>
            {sheetsConfig.spreadsheetUrl && (
              <a
                href={sheetsConfig.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs hover:shadow-xs transition-all shrink-0"
              >
                <span>{lang === 'vi' ? 'Xem DS User trên Sheets' : 'View DS User in Sheets'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* User Not In DS User Alert Banner */}
        {user && !isRoleFromSheet && sheetsConfig.spreadsheetId && (
          <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs animate-fade-in">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-amber-950">
                  {lang === 'vi'
                    ? `Tài khoản ${user.email} chưa có trong tab 'DS User'`
                    : `Account ${user.email} not in 'DS User' tab`}
                </p>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  {lang === 'vi'
                    ? "Hệ thống đang áp dụng quyền mặc định: Nhân viên. Hãy thêm một dòng với Email, Họ Và Tên, Phòng Ban, Vai Trò (Admin, Nhân viên, Trưởng bộ phận, Điều phối xe, Tài xế) vào tab 'DS User' trong Google Sheets để tự động gán quyền."
                    : "Default role (Employee) applied. Add a row with Email, Name, Department, and Role into 'DS User' sheet tab to automatically assign permissions."}
                </p>
              </div>
            </div>
            {sheetsConfig.spreadsheetUrl && (
              <a
                href={sheetsConfig.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-2xs transition-all shrink-0"
              >
                <span>{lang === 'vi' ? 'Mở Google Sheet' : 'Open Google Sheet'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Pending Approvals Alert Banner (Role 2: Manager & Role 0: Admin) */}
        {(role === 0 || role === 2) && pendingManagerCount > 0 && (
          <div className="bg-amber-500/10 border border-amber-300 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
              <div className="text-xs">
                <span className="font-bold text-amber-900">
                  {role === 0
                    ? lang === 'vi'
                      ? `Cần phê duyệt: Toàn hệ thống có ${pendingManagerCount} phiếu đặt xe đang chờ duyệt!`
                      : `Approval Needed: Entire system has ${pendingManagerCount} pending vehicle booking requests!`
                    : lang === 'vi'
                    ? `Cần phê duyệt: Phòng ban (${currentUser.department}) có ${pendingManagerCount} phiếu đặt xe đang chờ bạn duyệt!`
                    : `Approval Needed: ${currentUser.department} has ${pendingManagerCount} pending vehicle booking requests!`}
                </span>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  {lang === 'vi'
                    ? 'Bấm nút "Duyệt" trên thẻ phiếu hoặc bấm xem chi tiết để phê duyệt / từ chối.'
                    : 'Click "Approve" on card or view details to accept or decline.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveTab('bookings');
                setStatusFilter('pending');
              }}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap shadow-xs"
            >
              {lang === 'vi' ? 'Xem phiếu chờ duyệt' : 'Review pending'}
            </button>
          </div>
        )}

        {/* Role Banner Indicator & Active Persona Card */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                    role === 0
                      ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
                      : 'bg-blue-500/30 text-blue-200 border border-blue-400/30'
                  }`}
                >
                  {role === 0
                    ? '👑 Admin (Toàn Quyền Hệ Thống)'
                    : `${lang === 'vi' ? 'Vai trò ' : 'Role '}${role}: ${getRoleLabel(currentRoleString)}`}
                </span>
                {isAdminAccount && role !== 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-amber-950">
                    {lang === 'vi' ? '👑 Admin (Đang xem góc nhìn test)' : '👑 Admin (Testing View Mode)'}
                  </span>
                )}
                <span className="text-slate-400 text-xs hidden sm:inline">•</span>
                <span className="text-slate-300 text-xs font-medium bg-white/10 px-2 py-0.5 rounded-lg">
                  👤 {currentUser.name} ({currentUser.department || (role === 0 ? 'Ban Quản Trị' : 'Toàn công ty')})
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {lang === 'vi'
                  ? 'Hệ Thống Đặt Xe & Điều Động Phương Tiện Nội Bộ'
                  : 'Corporate Vehicle Booking & Fleet Dispatch System'}
              </h2>
              <p className="text-slate-300 text-xs mt-1">
                {t.roleDescriptions[currentRoleString]}
              </p>
            </div>

            {/* Google Sheets Link / Setup status */}
            <div className="flex items-center gap-2.5">
              {sheetsConfig.spreadsheetId ? (
                <div className="flex items-center bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 space-x-3">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{sheetsConfig.spreadsheetTitle}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="text-emerald-200 text-[10px]">
                      {lang === 'vi' ? 'Đã kết nối Google Drive' : 'Connected to Google Drive'}
                    </div>
                  </div>
                  <button
                    onClick={handlePullFromSheets}
                    disabled={isSyncing}
                    title={lang === 'vi' ? 'Tải dữ liệu từ Google Sheets về ứng dụng' : 'Pull data from Google Sheets'}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1 text-[11px] font-bold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{lang === 'vi' ? 'Tải về' : 'Pull'}</span>
                  </button>
                  {sheetsConfig.spreadsheetUrl && (
                    <a
                      href={sheetsConfig.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title={lang === 'vi' ? 'Mở Google Sheets trên tab mới' : 'Open Google Sheets in new tab'}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsSheetsModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-emerald-900/30"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{t.connectSheets}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* View Tabs Bar: Dynamically filtered by role */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex space-x-2 overflow-x-auto">
            {availableTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                        isActive ? 'bg-blue-800 text-blue-200' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Button: "+ Đăng Ký Đặt Xe" - Only for Role 1 (Employee) and Role 2 (Manager) */}
          {canCreateBooking && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>{t.newBooking}</span>
              </button>
            </div>
          )}
        </div>

        {/* View 1: Bookings List */}
        {activeTab === 'bookings' && (
          <div className="space-y-5">
            {/* Filter Bar: Search, Status Filter Chips, Department Filter */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
              {/* Search input */}
              <div className="relative min-w-[240px] flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Pills */}
              <div className="flex items-center space-x-1 overflow-x-auto text-xs">
                {[
                  { id: 'all', label: t.all },
                  { id: 'pending', label: lang === 'vi' ? 'Chờ duyệt' : 'Pending' },
                  { id: 'assigned', label: lang === 'vi' ? 'Đã xếp xe' : 'Assigned' },
                  { id: 'in_progress', label: lang === 'vi' ? 'Đang chạy' : 'In Progress' },
                  { id: 'completed', label: lang === 'vi' ? 'Hoàn thành' : 'Completed' },
                  { id: 'rejected', label: lang === 'vi' ? 'Từ chối' : 'Rejected' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStatusFilter(s.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                      statusFilter === s.id
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Department Dropdown: Dynamically loaded from Google Sheets tab 'DS Phòng Ban' */}
              <div className="shrink-0 flex items-center">
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium text-slate-700 shadow-2xs hover:border-slate-300 transition-colors cursor-pointer"
                  title={
                    lang === 'vi'
                      ? 'Lọc danh sách theo phòng ban (dữ liệu từ tab DS Phòng Ban)'
                      : 'Filter by department (loaded from DS Phòng Ban sheet)'
                  }
                >
                  <option value="all">{t.allDepartments}</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bookings Grid */}
            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4">
                <Car className="w-12 h-12 text-slate-300 mx-auto" />
                <div>
                  <h4 className="text-base font-bold text-slate-800">
                    {role === 1
                      ? (lang === 'vi' ? 'Bạn chưa tạo phiếu đặt xe nào' : 'You have no bookings created')
                      : role === 2
                      ? (lang === 'vi'
                          ? `Không có phiếu nào cần phê duyệt cho phòng ban ${currentUser.department}`
                          : `No pending requests for ${currentUser.department}`)
                      : t.noBookingsTitle}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    {role === 1
                      ? (lang === 'vi'
                          ? 'Bấm nút "+ Đăng Ký Đặt Xe" để gửi yêu cầu công tác mới đến Trưởng bộ phận duyệt.'
                          : 'Click "+ New Booking" to request a vehicle for business travel.')
                      : t.noBookingsDesc}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {canCreateBooking && (
                    <button
                      onClick={() => setIsBookingModalOpen(true)}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>{t.firstBookingCta}</span>
                    </button>
                  )}
                  {sheetsConfig.spreadsheetId ? (
                    <button
                      onClick={handlePullFromSheets}
                      disabled={isSyncing}
                      className="px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all"
                    >
                      <Download className="w-4 h-4 text-emerald-600" />
                      <span>{t.pullFromSheets}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsSheetsModalOpen(true)}
                      className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-sm"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>{t.connectSheets}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredBookings.map((b) => {
                  const assignedVehicle = vehicles.find((v) => v.id === b.assignedVehicleId);
                  const assignedDriver = drivers.find((d) => d.id === b.assignedDriverId);

                  return (
                    <BookingCard
                      key={b.id}
                      booking={b}
                      vehicle={assignedVehicle}
                      driver={assignedDriver}
                      currentRole={role}
                      onApproveByManager={handleApproveByManager}
                      onRejectByManager={handleRejectByManager}
                      onOpenDispatch={(booking) => setDispatchBooking(booking)}
                      onStartTrip={handleStartTrip}
                      onOpenComplete={(booking) => setCompleteBooking(booking)}
                      onCancelBooking={handleCancelBooking}
                      onSyncSingleToSheets={handleSyncSingleToSheets}
                      onViewDetails={(booking) => setSelectedBookingDetail(booking)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* View 2: Timeline Schedule */}
        {activeTab === 'timeline' && (
          <FleetScheduleTimeline
            vehicles={vehicles}
            bookings={bookings}
            currentRole={role}
            currentUser={currentUser}
            drivers={drivers}
            onSelectBooking={(b) => setSelectedBookingDetail(b)}
            onNavigateToFleet={() => {
              if (role === 0 || role === 3) setActiveTab('fleet');
            }}
            onStartTrip={handleStartTrip}
            onOpenComplete={(b) => setCompleteBooking(b)}
          />
        )}

        {/* View 3: Fleet & Drivers (For Admin: role = 0 and Dispatcher: role = 3) */}
        {activeTab === 'fleet' && (role === 0 || role === 3) && (
          <FleetList
            vehicles={vehicles}
            drivers={drivers}
            onAddVehicle={handleAddVehicle}
            onUpdateVehicleStatus={handleUpdateVehicleStatus}
            onAddDriver={handleAddDriver}
            onRefreshFromSheets={handlePullFromSheets}
            isRefreshing={isSyncing}
            lastSyncTime={sheetsConfig.lastSyncTime}
            hasConnectedSheets={!!sheetsConfig.spreadsheetId}
          />
        )}

        {/* View 4: Analytics (For Admin: role = 0, Manager: role = 2, and Dispatcher: role = 3) */}
        {activeTab === 'analytics' && (role === 0 || role === 2 || role === 3) && (
          <AnalyticsView
            bookings={role === 2 ? roleFilteredBookings : bookings}
            vehicles={vehicles}
            drivers={drivers}
            spreadsheetUrl={sheetsConfig.spreadsheetUrl}
          />
        )}
      </main>

      {/* Modals */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSubmit={handleCreateBooking}
        currentUserEmail={currentUser.email || user?.email || ''}
        currentUserName={currentUser.name || user?.displayName || ''}
        currentUserPhone={currentUser.phone}
        currentUserDepartment={currentUser.department}
        departments={departments}
      />

      {/* Booking Detail Modal with RBAC Actions (Approve / Reject for Manager) */}
      <BookingDetailModal
        isOpen={!!selectedBookingDetail}
        onClose={() => setSelectedBookingDetail(null)}
        booking={selectedBookingDetail}
        vehicle={vehicles.find((v) => v.id === selectedBookingDetail?.assignedVehicleId)}
        driver={drivers.find((d) => d.id === selectedBookingDetail?.assignedDriverId)}
        currentRole={role}
        onApproveByManager={handleApproveByManager}
        onRejectByManager={handleRejectByManager}
        onOpenDispatch={(b) => setDispatchBooking(b)}
        onStartTrip={handleStartTrip}
        onOpenComplete={(b) => setCompleteBooking(b)}
        onCancelBooking={handleCancelBooking}
      />

      <DispatchModal
        isOpen={!!dispatchBooking}
        onClose={() => setDispatchBooking(null)}
        booking={dispatchBooking}
        vehicles={vehicles}
        drivers={drivers}
        onConfirmDispatch={handleConfirmDispatch}
      />

      <CompleteTripModal
        isOpen={!!completeBooking}
        onClose={() => setCompleteBooking(null)}
        booking={completeBooking}
        vehicle={vehicles.find((v) => v.id === completeBooking?.assignedVehicleId)}
        onConfirmComplete={handleConfirmComplete}
      />

      <SheetsSyncModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        sheetsConfig={sheetsConfig}
        onUpdateConfig={setSheetsConfig}
        accessToken={accessToken}
        onRequireAuth={handleGoogleSignIn}
        bookings={bookings}
        vehicles={vehicles}
        drivers={drivers}
        onLoadDataFromSheets={(data) => {
          setBookings(data.bookings);
          setVehicles(data.vehicles);
          setDrivers(data.drivers);
          if (data.departments && data.departments.length > 0) {
            setDepartments(data.departments);
            localStorage.setItem('autofleet_departments', JSON.stringify(data.departments));
          }
          if (data.users && data.users.length > 0) {
            setSheetUsers(data.users);
            localStorage.setItem('autofleet_sheet_users', JSON.stringify(data.users));
            const emailToCheck = user?.email || currentUser.email;
            if (emailToCheck) {
              applyUserFromSheet(emailToCheck, data.users);
            }
          }
        }}
        onClearLocalData={handleClearLocalData}
      />

      <RouteEstimatorModal
        isOpen={isRouteEstimatorOpen}
        onClose={() => setIsRouteEstimatorOpen(false)}
        onApplyRoute={(origin, dest, dist) => {
          setIsBookingModalOpen(true);
        }}
      />

      {/* Universal Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        details={confirmModal.details}
        isDestructive={confirmModal.isDestructive}
        onConfirm={() => {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          confirmModal.action();
        }}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
