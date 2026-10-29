import React, { useState } from 'react';
import {
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  PlusCircle,
  Link2,
  CheckCircle2,
  AlertCircle,
  Database,
  X,
  FileCheck,
  ShieldCheck,
  Download,
  Trash2,
} from 'lucide-react';
import { SheetsConfig, Booking, Vehicle, Driver } from '../types/fleet';
import {
  createFleetSpreadsheet,
  syncAllToSheets,
  loadAllFromSheets,
  getSpreadsheetInfo,
  DEFAULT_SHEET_TITLE,
} from '../services/sheetsService';
import { ConfirmationModal } from './ConfirmationModal';
import { useLanguage } from '../i18n/LanguageContext';

interface SheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheetsConfig: SheetsConfig;
  onUpdateConfig: (config: SheetsConfig) => void;
  accessToken: string | null;
  onRequireAuth: () => void;
  bookings: Booking[];
  vehicles: Vehicle[];
  drivers: Driver[];
  onLoadDataFromSheets: (data: {
    bookings: Booking[];
    vehicles: Vehicle[];
    drivers: Driver[];
    departments?: string[];
    users?: any[];
  }) => void;
  onClearLocalData: () => void;
}

export const SheetsSyncModal: React.FC<SheetsSyncModalProps> = ({
  isOpen,
  onClose,
  sheetsConfig,
  onUpdateConfig,
  accessToken,
  onRequireAuth,
  bookings,
  vehicles,
  drivers,
  onLoadDataFromSheets,
  onClearLocalData,
}) => {
  const { lang, t } = useLanguage();
  const [customSheetId, setCustomSheetId] = useState('');
  const [customTitle, setCustomTitle] = useState(DEFAULT_SHEET_TITLE);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    details?: string[];
    isDestructive: boolean;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    isDestructive: false,
    action: async () => {},
  });

  if (!isOpen) return null;

  const handleCreateNewSheet = async () => {
    if (!accessToken) {
      onRequireAuth();
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Tạo Google Spreadsheet mới',
      message: `Bạn chuẩn bị tạo một Google Sheet mới với tên "${customTitle}" trong Google Drive của bạn (chuẩn bị sẵn các cột tiêu đề rỗng cho Đặt xe, Đội xe và Tài xế).`,
      details: [
        'Vị trí lưu: Google Drive của tài khoản đang đăng nhập',
        `Số lượng chuyến xe hiện tại: ${bookings.length} phiếu`,
        `Số lượng phương tiện: ${vehicles.length} xe`,
        `Số lượng tài xế: ${drivers.length} tài xế`,
      ],
      isDestructive: false,
      action: async () => {
        setIsLoading(true);
        setStatusMessage({ type: 'info', text: 'Đang khởi tạo Google Spreadsheet mới...' });
        try {
          const { spreadsheetId, spreadsheetUrl } = await createFleetSpreadsheet(
            accessToken,
            customTitle
          );

          // If there is existing data, sync it; otherwise sheet remains clean with headers only
          if (bookings.length > 0 || vehicles.length > 0 || drivers.length > 0) {
            await syncAllToSheets(accessToken, spreadsheetId, bookings, vehicles, drivers);
          }

          const updatedConfig: SheetsConfig = {
            spreadsheetId,
            spreadsheetTitle: customTitle,
            spreadsheetUrl,
            sheetName: 'Danh Sách Đặt Xe',
            autoSync: true,
            lastSyncTime: new Date().toISOString(),
          };

          onUpdateConfig(updatedConfig);
          setStatusMessage({
            type: 'success',
            text: `Đã tạo và kết nối thành công bảng tính "${customTitle}"!`,
          });
        } catch (err: any) {
          console.error(err);
          setStatusMessage({
            type: 'error',
            text: err.message || 'Lỗi khi khởi tạo Google Sheet. Vui lòng thử lại.',
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleConnectExisting = async () => {
    if (!accessToken) {
      onRequireAuth();
      return;
    }

    const trimmed = customSheetId.trim();
    if (!trimmed) {
      setStatusMessage({ type: 'error', text: 'Vui lòng nhập ID hoặc link Google Sheet hợp lệ' });
      return;
    }

    // Extract ID if full URL pasted
    let id = trimmed;
    const match = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      id = match[1];
    }

    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Đang kiểm tra kết nối Google Sheet...' });

    try {
      const info = await getSpreadsheetInfo(accessToken, id);

      const updatedConfig: SheetsConfig = {
        spreadsheetId: id,
        spreadsheetTitle: info.title,
        spreadsheetUrl: info.url,
        sheetName: 'Danh Sách Đặt Xe',
        autoSync: true,
        lastSyncTime: sheetsConfig.lastSyncTime,
      };

      onUpdateConfig(updatedConfig);

      // Auto load data from this sheet
      try {
        const loaded = await loadAllFromSheets(accessToken, id);
        onLoadDataFromSheets(loaded);
        setStatusMessage({
          type: 'success',
          text: `Đã kết nối "${info.title}" và đọc được: ${loaded.bookings.length} phiếu đặt xe, ${loaded.vehicles.length} xe, ${loaded.drivers.length} tài xế (nếu trang tính trống, hiển thị danh sách rỗng).`,
        });
      } catch (readErr) {
        setStatusMessage({
          type: 'success',
          text: `Đã kết nối thành công với bảng "${info.title}"!`,
        });
      }

      setCustomSheetId('');
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: `Không tìm thấy bảng tính hoặc tài khoản chưa được phân quyền truy cập.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePullFromSheets = async () => {
    if (!accessToken) {
      onRequireAuth();
      return;
    }
    if (!sheetsConfig.spreadsheetId) {
      setStatusMessage({ type: 'error', text: 'Chưa có Google Sheet nào được kết nối.' });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Tải dữ liệu từ Google Sheets',
      message:
        'Ứng dụng sẽ đọc toàn bộ dữ liệu trực tiếp từ các tab trong Google Sheet. Nếu Google Sheet đang trống (chưa có dòng dữ liệu nào), ứng dụng sẽ hiển thị danh sách trống hoàn toàn.',
      details: [
        `Google Sheet: ${sheetsConfig.spreadsheetTitle}`,
        'Dữ liệu đọc: Danh Sách Đặt Xe, Đội Xe Công Ty, Danh Sách Tài Xế, DS Phòng Ban, DS User',
      ],
      isDestructive: false,
      action: async () => {
        setIsLoading(true);
        setStatusMessage({ type: 'info', text: 'Đang đọc dữ liệu từ Google Sheets...' });
        try {
          const loaded = await loadAllFromSheets(accessToken, sheetsConfig.spreadsheetId!);
          onLoadDataFromSheets(loaded);
          onUpdateConfig({
            ...sheetsConfig,
            lastSyncTime: new Date().toISOString(),
          });
          const deptCount = loaded.departments && loaded.departments.length > 0 ? `, ${loaded.departments.length} phòng ban` : '';
          const userCount = loaded.users && loaded.users.length > 0 ? `, ${loaded.users.length} tài khoản (tab DS User)` : '';
          setStatusMessage({
            type: 'success',
            text: `Đọc dữ liệu thành công! Tìm thấy: ${loaded.bookings.length} phiếu đặt xe, ${loaded.vehicles.length} xe, ${loaded.drivers.length} tài xế${deptCount}${userCount}.`,
          });
        } catch (err: any) {
          console.error(err);
          setStatusMessage({
            type: 'error',
            text: err.message || 'Lỗi khi đọc dữ liệu từ Google Sheets.',
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleSyncAllNow = async () => {
    if (!accessToken) {
      onRequireAuth();
      return;
    }
    if (!sheetsConfig.spreadsheetId) {
      setStatusMessage({ type: 'error', text: 'Chưa có Google Sheet nào được kết nối.' });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Đồng bộ toàn bộ dữ liệu lên Google Sheets',
      message:
        'Thao tác này sẽ ghi đè và cập nhật danh sách các chuyến đi, tình trạng phương tiện và tài xế hiện có vào Google Sheet đã kết nối.',
      details: [
        `Google Sheet: ${sheetsConfig.spreadsheetTitle}`,
        `Cập nhật: ${bookings.length} chuyến xe`,
        `Cập nhật: ${vehicles.length} phương tiện`,
        `Cập nhật: ${drivers.length} tài xế`,
      ],
      isDestructive: false,
      action: async () => {
        setIsLoading(true);
        setStatusMessage({ type: 'info', text: 'Đang gửi dữ liệu lên Google Sheets...' });
        try {
          await syncAllToSheets(
            accessToken,
            sheetsConfig.spreadsheetId!,
            bookings,
            vehicles,
            drivers
          );
          onUpdateConfig({
            ...sheetsConfig,
            lastSyncTime: new Date().toISOString(),
          });
          setStatusMessage({
            type: 'success',
            text: 'Đồng bộ dữ liệu lên Google Sheets hoàn tất!',
          });
        } catch (err: any) {
          console.error(err);
          setStatusMessage({
            type: 'error',
            text: err.message || 'Lỗi khi đồng bộ dữ liệu.',
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-800 to-teal-900 text-white">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-500/20 backdrop-blur-md rounded-xl border border-emerald-400/30">
                <FileSpreadsheet className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {lang === 'vi' ? 'Quản Lý Kết Nối Google Sheets' : 'Google Sheets Integration'}
                </h3>
                <p className="text-xs text-emerald-200">
                  {lang === 'vi' ? 'Lưu trữ & đồng bộ hồ sơ điều xe công ty theo thời gian thực' : 'Real-time corporate fleet & booking record synchronization'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Status Alert Banner */}
            {statusMessage && (
              <div
                className={`p-3.5 rounded-xl border flex items-center space-x-3 text-xs font-medium ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : statusMessage.type === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : statusMessage.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                ) : (
                  <RefreshCw className="w-4 h-4 shrink-0 animate-spin text-blue-600" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Current Connection Status */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {lang === 'vi' ? 'Trạng Thái Liên Kết Hiện Tại' : 'Current Connection Status'}
                  </span>
                </div>
                {sheetsConfig.spreadsheetId ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {lang === 'vi' ? 'Đã Kết Nối' : 'Connected'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    {lang === 'vi' ? 'Chưa Liên Kết' : 'Not Linked'}
                  </span>
                )}
              </div>

              {sheetsConfig.spreadsheetId ? (
                <div className="space-y-3">
                  <div className="flex items-start justify-between bg-white p-3.5 rounded-xl border border-slate-200">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        {sheetsConfig.spreadsheetTitle}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-sm">
                        ID: {sheetsConfig.spreadsheetId}
                      </p>
                      {sheetsConfig.lastSyncTime && (
                        <p className="text-xs text-slate-500 mt-1">
                          {lang === 'vi' ? 'Lần đồng bộ gần nhất:' : 'Last synchronized:'}{' '}
                          <span className="font-medium text-slate-700">
                            {new Date(sheetsConfig.lastSyncTime).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')}
                          </span>
                        </p>
                      )}
                    </div>
                    {sheetsConfig.spreadsheetUrl && (
                      <a
                        href={sheetsConfig.spreadsheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                      >
                        <span>{t.viewGoogleSheet}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoSync"
                      checked={sheetsConfig.autoSync}
                      onChange={(e) =>
                        onUpdateConfig({
                          ...sheetsConfig,
                          autoSync: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500"
                    />
                    <label htmlFor="autoSync" className="text-xs text-slate-700 font-medium">
                      {lang === 'vi'
                        ? 'Tự động ghi vào Sheet khi có chuyến mới hoặc thay đổi trạng thái'
                        : 'Automatically write to Sheet on new bookings or status changes'}
                    </label>
                  </div>

                  {/* Sync Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
                    <button
                      type="button"
                      onClick={handlePullFromSheets}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-2xs"
                      title={lang === 'vi' ? 'Đọc dữ liệu từ Google Sheets về máy' : 'Pull data from Google Sheets'}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t.pullFromSheets}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSyncAllNow}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 active:scale-95 transition-all shadow-2xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>{lang === 'vi' ? `Đồng Bộ Lên Sheets (${bookings.length})` : `Sync To Sheets (${bookings.length})`}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 leading-relaxed">
                  {lang === 'vi'
                    ? 'Hiện chưa có Google Sheet nào được thiết lập. Hãy tạo mới một bảng tính quản lý hoặc kết nối đến bảng tính có sẵn của công ty bên dưới.'
                    : 'No Google Sheet is configured. Create a new management sheet or connect to an existing company sheet below.'}
                </p>
              )}
            </div>

            {/* Actions: Option 1 (Create New) vs Option 2 (Connect Existing) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Create New Sheet */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-3">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">
                    {lang === 'vi' ? 'Tạo bảng tính Google Sheets mới' : 'Create New Google Spreadsheet'}
                  </h4>
                  <p className="text-xs text-slate-500 mb-3">
                    {lang === 'vi'
                      ? 'Tự động tạo file Sheet chuẩn với 3 sheet: "Danh Sách Đặt Xe", "Đội Xe", "Tài Xế".'
                      : 'Automatically creates standard tabs: "Bookings", "Fleet", "Drivers".'}
                  </p>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    {lang === 'vi' ? 'Tên bảng tính:' : 'Spreadsheet Name:'}
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder={lang === 'vi' ? 'VD: Sổ Quản Lý Đặt Xe Nội Bộ' : 'e.g. Corporate Fleet & Booking Register'}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-3"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCreateNewSheet}
                  disabled={isLoading}
                  className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-2xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{lang === 'vi' ? 'Tạo Bảng Tính Mới Trong Drive' : 'Create New Sheet in Drive'}</span>
                </button>
              </div>

              {/* Option 2: Connect Existing */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mb-3">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">
                    {lang === 'vi' ? 'Liên kết Sheet đã có sẵn' : 'Connect Existing Sheet'}
                  </h4>
                  <p className="text-xs text-slate-500 mb-3">
                    {lang === 'vi'
                      ? 'Dán URL hoặc Spreadsheet ID của bảng tính Google Sheets bạn muốn đồng bộ.'
                      : 'Paste the URL or Spreadsheet ID of your Google Sheet.'}
                  </p>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    {lang === 'vi' ? 'ID hoặc Đường dẫn URL Sheet:' : 'Sheet ID or URL:'}
                  </label>
                  <input
                    type="text"
                    value={customSheetId}
                    onChange={(e) => setCustomSheetId(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleConnectExisting}
                  disabled={isLoading || !customSheetId.trim()}
                  className="w-full py-2.5 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-2xs"
                >
                  <Link2 className="w-4 h-4" />
                  <span>{lang === 'vi' ? 'Kết Nối Bảng Tính Này' : 'Connect This Spreadsheet'}</span>
                </button>
              </div>
            </div>

            {/* Clear Local Data Option */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-800 block">
                  {lang === 'vi' ? 'Xóa dữ liệu bộ nhớ đệm:' : 'Clear cache:'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {lang === 'vi'
                    ? 'Xóa toàn bộ chuyến xe, phương tiện và tài xế đã lưu tạm để đưa về danh sách trống.'
                    : 'Clear all locally cached bookings, vehicles, and drivers to reset to an empty list.'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setConfirmModal({
                    isOpen: true,
                    title: lang === 'vi' ? 'Xác nhận xóa sạch dữ liệu cục bộ' : 'Confirm Clear Local Cache',
                    message: lang === 'vi'
                      ? 'Bạn có chắc chắn muốn xóa toàn bộ danh sách đặt xe, phương tiện và tài xế trong bộ nhớ tạm để đưa về danh sách trống?'
                      : 'Are you sure you want to clear all locally cached bookings, vehicles, and drivers to reset to an empty list?',
                    isDestructive: true,
                    action: async () => {
                      onClearLocalData();
                      setStatusMessage({
                        type: 'info',
                        text: lang === 'vi' ? 'Đã xóa toàn bộ dữ liệu tạm thời về danh sách trống.' : 'All local cache cleared to empty state.',
                      });
                    },
                  });
                }}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === 'vi' ? 'Xóa Về Trống' : 'Reset to Empty'}</span>
              </button>
            </div>

            {/* Google Workspace Permission Info */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">
                  {lang === 'vi' ? 'Bảo mật và Quyền hạn Google Workspace:' : 'Google Workspace Security & Permissions:'}
                </span>
                <p>
                  {lang === 'vi'
                    ? 'Ứng dụng chỉ truy cập và ghi dữ liệu vào các bảng tính do bạn chỉ định hoặc tạo ra thông qua quyền Google Drive & Google Sheets với sự đồng thuận của bạn. Nếu Google Sheet đang trống, ứng dụng sẽ hiển thị danh sách rỗng hoàn toàn mà không chèn dữ liệu mẫu.'
                    : 'The application only reads and writes data to spreadsheets explicitly selected or created with your Google Drive & Sheets consent. If the spreadsheet is empty, the app renders an empty list without injecting dummy data.'}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors shadow-2xs"
            >
              {t.close}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        details={confirmModal.details}
        isDestructive={confirmModal.isDestructive}
        isLoading={isLoading}
        onConfirm={async () => {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          await confirmModal.action();
        }}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
};
