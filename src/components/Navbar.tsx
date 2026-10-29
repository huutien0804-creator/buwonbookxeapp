import React, { useState } from 'react';
import {
  Car,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  LogOut,
  Compass,
  Download,
  Languages,
  SlidersHorizontal,
  ShieldCheck,
} from 'lucide-react';
import { UserRole, NumericRole, UserProfile, ROLE_MAP, SheetsConfig } from '../types/fleet';
import { User as FirebaseUser } from 'firebase/auth';
import { useLanguage } from '../i18n/LanguageContext';

interface NavbarProps {
  currentRole: NumericRole;
  onChangeRole: (role: NumericRole) => void;
  currentUser?: UserProfile;
  sheetsConfig: SheetsConfig;
  isRoleFromSheet?: boolean;
  isAdmin?: boolean;
  onOpenSheetsModal: () => void;
  onOpenBookingModal: () => void;
  onOpenRouteEstimator: () => void;
  user: FirebaseUser | null;
  onGoogleSignIn: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  onQuickSync: () => void;
  onPullFromSheets: () => void;
  isSyncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onChangeRole,
  currentUser,
  sheetsConfig,
  isRoleFromSheet = false,
  isAdmin = false,
  onOpenSheetsModal,
  onOpenBookingModal,
  onOpenRouteEstimator,
  user,
  onGoogleSignIn,
  onLogout,
  isLoggingIn,
  onQuickSync,
  onPullFromSheets,
  isSyncing,
}) => {
  const { lang, toggleLang, t, getRoleLabel } = useLanguage();
  const [showDevSwitcher, setShowDevSwitcher] = useState(false);

  const roles: { role: NumericRole; id: UserRole; icon: string; num: number; label: string }[] = [
    { role: 0, id: 'admin', icon: '👑', num: 0, label: 'Admin (Toàn quyền)' },
    { role: 1, id: 'employee', icon: '👤', num: 1, label: 'Nhân viên' },
    { role: 2, id: 'manager', icon: '👔', num: 2, label: 'Trưởng bộ phận' },
    { role: 3, id: 'dispatcher', icon: '📋', num: 3, label: 'Điều phối xe' },
    { role: 4, id: 'driver', icon: '🚗', num: 4, label: 'Tài xế' },
  ];

  const activeRoleObj = roles.find((r) => r.role === currentRole) || roles[0];
  // canCreateBooking: Admin (0), Employee (1), Manager (2)
  const canCreateBooking = currentRole === 0 || currentRole === 1 || currentRole === 2;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-3 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-extrabold text-slate-900 tracking-tight">
                  {t.appTitle}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {t.appBadge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* ADMIN ONLY: Rapid Role Switcher Bar (Góc nhìn / View Mode) */}
          {isAdmin ? (
            <div className="hidden lg:flex items-center bg-slate-100/95 p-1 rounded-2xl border border-slate-300/80 text-xs shadow-2xs">
              <div className="flex items-center gap-1 px-2 text-[10px] font-black uppercase text-amber-700 tracking-wider">
                <span>👑</span>
                <span>{lang === 'vi' ? 'Góc nhìn:' : 'View mode:'}</span>
              </div>
              {roles.map((r) => {
                const isActive = currentRole === r.role;
                return (
                  <button
                    key={r.role}
                    onClick={() => onChangeRole(r.role)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
                      isActive
                        ? r.role === 0
                          ? 'bg-amber-500 text-white shadow-xs font-black'
                          : 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                    title={`Chuyển góc nhìn sang ${r.label}`}
                  >
                    <span>{r.icon}</span>
                    <span>{r.role === 0 ? 'Admin' : getRoleLabel(r.id)}</span>
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded-md font-mono ${
                        isActive ? 'bg-black/20 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {r.num}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Regular User: Static Verified Profile & Role Badge */
            <div className="hidden md:flex items-center space-x-2">
              <div className="flex items-center space-x-2.5 bg-slate-100/90 border border-slate-200/80 px-3.5 py-1.5 rounded-2xl">
                <span className="text-base">{activeRoleObj.icon}</span>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900">
                      {getRoleLabel(activeRoleObj.id)}
                    </span>
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-800">
                      Role {currentRole}
                    </span>
                    {isRoleFromSheet && (
                      <span
                        className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 tracking-wide"
                        title="Phân quyền tự động từ Google Sheets tab 'DS User'"
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-600 inline" />
                        DS User
                      </span>
                    )}
                  </div>
                  {currentUser?.department && (
                    <span className="text-[11px] font-medium text-slate-500 truncate max-w-[180px]">
                      {currentUser.department}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Right Action Tools: Language Switcher, Route Calc, Sheets, Booking CTA, Google Auth */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Language Switcher Pill */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-2xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  if (lang !== 'vi') toggleLang();
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  lang === 'vi'
                    ? 'bg-white text-blue-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Chuyển sang Tiếng Việt"
              >
                <span>🇻🇳</span>
                <span className="font-mono text-[11px]">VI</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (lang !== 'en') toggleLang();
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  lang === 'en'
                    ? 'bg-white text-blue-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Switch to English"
              >
                <span>🇬🇧</span>
                <span className="font-mono text-[11px]">EN</span>
              </button>
            </div>

            {/* Route Calculator Button */}
            <button
              onClick={onOpenRouteEstimator}
              title={t.routeEstimator}
              className="p-2 sm:px-3 sm:py-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-2xl border border-slate-200/80 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <Compass className="w-4 h-4 text-blue-600" />
              <span className="hidden lg:inline">{t.routeEstimator}</span>
            </button>

            {/* Google Sheets Status Pill */}
            <div className="flex items-center bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-1 pr-2">
              <button
                onClick={onOpenSheetsModal}
                className="flex items-center space-x-1.5 px-2 py-1 text-emerald-800 hover:text-emerald-950 text-xs font-bold transition-colors"
                title={sheetsConfig.spreadsheetId ? t.googleSheets : t.connectSheets}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="hidden sm:inline">
                  {sheetsConfig.spreadsheetId ? t.googleSheets : t.connectSheets}
                </span>
              </button>

              {sheetsConfig.spreadsheetId && (
                <div className="flex items-center space-x-1 border-l border-emerald-200 pl-1 ml-1">
                  <button
                    onClick={onPullFromSheets}
                    disabled={isSyncing}
                    title={t.pullFromSheets}
                    className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onQuickSync}
                    disabled={isSyncing}
                    title={t.quickSync}
                    className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              )}
            </div>

            {/* Main Booking Action - Only shown for Role 1 (Employee) and Role 2 (Manager) */}
            {canCreateBooking && (
              <button
                onClick={onOpenBookingModal}
                className="flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{t.newBooking}</span>
              </button>
            )}

            {/* Google Auth Status / Button */}
            {user ? (
              <div className="flex items-center space-x-1.5 sm:space-x-2 pl-1 border-l border-slate-200">
                <div
                  className="flex items-center space-x-2 p-1 pr-2 rounded-2xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                  onClick={onOpenSheetsModal}
                  title={`${user.email}`}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-7 h-7 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      {user.displayName?.[0] || 'U'}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-700 max-w-[80px] truncate hidden xl:inline">
                    {user.displayName?.split(' ').slice(-1)[0] || 'User'}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  title={t.logout}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onGoogleSignIn}
                disabled={isLoggingIn}
                className="gsi-material-button shadow-2xs"
                title={t.loginWithGoogle}
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      style={{ display: 'block' }}
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      ></path>
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      ></path>
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      ></path>
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      ></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents text-xs">
                    {isLoggingIn ? '...' : 'Google'}
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Info / Role Badge */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-100 gap-2">
          <div className="flex items-center space-x-1.5">
            <span className="text-sm">{activeRoleObj.icon}</span>
            <span className="text-xs font-black text-slate-800">
              {currentRole === 0 ? 'Admin' : getRoleLabel(activeRoleObj.id)}
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md font-bold ${currentRole === 0 ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-800'}`}>
              Role {currentRole}
            </span>
            {isAdmin && (
              <span className="text-[9px] font-extrabold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                👑 Admin
              </span>
            )}
            {isRoleFromSheet && !isAdmin && (
              <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                ✓ DS User
              </span>
            )}
            {currentUser?.department && (
              <span className="text-[11px] text-slate-500 truncate max-w-[110px]">
                • {currentUser.department}
              </span>
            )}
          </div>
          {isAdmin && (
            <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
              {lang === 'vi' ? 'Góc nhìn' : 'View Mode'}
            </span>
          )}
        </div>

        {/* Mobile Role Switcher Bar - prominently displayed for Admin */}
        {isAdmin && (
          <div className="flex md:hidden items-center justify-between py-1.5 border-t border-amber-200 bg-amber-50/70 px-2 rounded-xl overflow-x-auto gap-1 mb-2">
            {roles.map((r) => (
              <button
                key={r.role}
                onClick={() => onChangeRole(r.role)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl font-bold text-[11px] whitespace-nowrap transition-all ${
                  currentRole === r.role
                    ? r.role === 0
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 bg-white'
                }`}
              >
                <span>{r.icon}</span>
                <span>{r.role === 0 ? 'Admin' : getRoleLabel(r.id)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
