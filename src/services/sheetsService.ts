import {
  Booking,
  Vehicle,
  Driver,
  BookingStatus,
  VehicleType,
  Priority,
  TripType,
  VehicleStatus,
  SheetUser,
  NumericRole,
} from '../types/fleet';

export const DEFAULT_SHEET_TITLE = 'Sổ Quản Lý Đặt Xe Nội Bộ Công Ty';
export const BOOKINGS_SHEET_NAME = 'Danh Sách Đặt Xe';
export const FLEET_SHEET_NAME = 'Đội Xe Công Ty';
export const DRIVERS_SHEET_NAME = 'Danh Sách Tài Xế';
export const DEPARTMENTS_SHEET_NAME = 'DS Phòng Ban';
export const USERS_SHEET_NAME = 'DS User';

export const USERS_HEADERS = [
  'Email',
  'Họ Và Tên',
  'Phòng Ban',
  'Vai Trò',
];

export const DEPARTMENTS_HEADERS = [
  'STT',
  'Tên Phòng Ban',
  'Mã Phòng Ban',
  'Ghi Chú',
];

export const BOOKING_HEADERS = [
  'Mã Phiếu',
  'Trạng Thái',
  'Người Yêu Cầu',
  'Phòng Ban',
  'Số Điện Thoại',
  'Mục Đích Chuyến Đi',
  'Điểm Đón',
  'Điểm Đến',
  'Thời Gian Khởi Hành',
  'Thời Gian Kết Thúc',
  'Hình Thức',
  'Loại Xe Yêu Cầu',
  'Xe Điều Phối',
  'Biển Số Xe',
  'Tài Xế Phụ Trách',
  'Số Lượng Khách',
  'KM Dự Kiến',
  'KM Thực Tế',
  'Phí Cầu Đường (VNĐ)',
  'Chi Phí Xăng (VNĐ)',
  'Ghi Chú',
  'Thời Gian Tạo',
];

export const FLEET_HEADERS = [
  'Mã Xe',
  'Biển Số',
  'Dòng Xe',
  'Phân Loại',
  'Số Chỗ',
  'Nhiên Liệu',
  'Số ODO (KM)',
  'Trạng Thái',
  'Định Mức Tiêu Hao',
  'Năm Sản Xuất',
];

export const DRIVER_HEADERS = [
  'Mã Tài Xế',
  'Họ Và Tên',
  'Số Điện Thoại',
  'Số GPLX',
  'Hạng Bằng',
  'Kinh Nghiệm (Năm)',
  'Đánh Giá (Sao)',
  'Trạng Thái',
];

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending_manager: 'Chờ Quản Lý Duyệt',
  pending_dispatch: 'Chờ Điều Phối Xếp Xe',
  assigned: 'Đã Phân Xe & Tài Xế',
  in_progress: 'Đang Thực Hiện',
  completed: 'Hoàn Thành',
  rejected: 'Bị Từ Chối',
  cancelled: 'Đã Hủy',
};

export const REVERSE_STATUS_MAP: Record<string, BookingStatus> = {
  'Chờ Quản Lý Duyệt': 'pending_manager',
  'Chờ Điều Phối Xếp Xe': 'pending_dispatch',
  'Đã Phân Xe & Tài Xế': 'assigned',
  'Đang Thực Hiện': 'in_progress',
  'Hoàn Thành': 'completed',
  'Bị Từ Chối': 'rejected',
  'Đã Hủy': 'cancelled',
};

export const VEHICLE_TYPE_LABELS: Record<string, string> = {
  sedan_4: 'Sedan 4-5 chỗ',
  suv_7: 'SUV/Crossover 7 chỗ',
  van_16: 'Xe 16 chỗ Solati/Ford',
  pickup: 'Bán tải chở hàng',
};

export const REVERSE_VEHICLE_TYPE_MAP: Record<string, VehicleType> = {
  'Sedan 4-5 chỗ': 'sedan_4',
  'SUV/Crossover 7 chỗ': 'suv_7',
  'Xe 16 chỗ Solati/Ford': 'van_16',
  'Bán tải chở hàng': 'pickup',
};

/**
 * Creates a master vehicle management Google Spreadsheet with formatted tabs and headers
 */
export async function createFleetSpreadsheet(
  accessToken: string,
  title: string = DEFAULT_SHEET_TITLE
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const requestBody = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: BOOKINGS_SHEET_NAME,
          gridProperties: {
            frozenRowCount: 1,
            rowCount: 200,
            columnCount: BOOKING_HEADERS.length,
          },
        },
      },
      {
        properties: {
          title: FLEET_SHEET_NAME,
          gridProperties: {
            frozenRowCount: 1,
            rowCount: 100,
            columnCount: FLEET_HEADERS.length,
          },
        },
      },
      {
        properties: {
          title: DRIVERS_SHEET_NAME,
          gridProperties: {
            frozenRowCount: 1,
            rowCount: 50,
            columnCount: DRIVER_HEADERS.length,
          },
        },
      },
      {
        properties: {
          title: DEPARTMENTS_SHEET_NAME,
          gridProperties: {
            frozenRowCount: 1,
            rowCount: 50,
            columnCount: DEPARTMENTS_HEADERS.length,
          },
        },
      },
      {
        properties: {
          title: USERS_SHEET_NAME,
          gridProperties: {
            frozenRowCount: 1,
            rowCount: 50,
            columnCount: USERS_HEADERS.length,
          },
        },
      },
    ],
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Tạo Google Sheet thất bại: ${errorText}`);
  }

  const createdData = await createRes.json();
  const spreadsheetId = createdData.spreadsheetId;
  const spreadsheetUrl = createdData.spreadsheetUrl;

  // Insert headers for all sheets
  await populateSheetHeaders(accessToken, spreadsheetId);

  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Populates header rows and applies professional formatting
 */
export async function populateSheetHeaders(accessToken: string, spreadsheetId: string) {
  const valueUpdates = [
    {
      range: `'${BOOKINGS_SHEET_NAME}'!A1:${getColumnLetter(BOOKING_HEADERS.length)}1`,
      values: [BOOKING_HEADERS],
    },
    {
      range: `'${FLEET_SHEET_NAME}'!A1:${getColumnLetter(FLEET_HEADERS.length)}1`,
      values: [FLEET_HEADERS],
    },
    {
      range: `'${DRIVERS_SHEET_NAME}'!A1:${getColumnLetter(DRIVER_HEADERS.length)}1`,
      values: [DRIVER_HEADERS],
    },
    {
      range: `'${DEPARTMENTS_SHEET_NAME}'!A1:${getColumnLetter(DEPARTMENTS_HEADERS.length)}1`,
      values: [DEPARTMENTS_HEADERS],
    },
    {
      range: `'${USERS_SHEET_NAME}'!A1:${getColumnLetter(USERS_HEADERS.length)}1`,
      values: [USERS_HEADERS],
    },
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: valueUpdates,
      }),
    }
  );

  try {
    const sheetMetaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(sheetId,title))`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (sheetMetaRes.ok) {
      const meta = await sheetMetaRes.json();
      const requests = meta.sheets.map((sheet: any) => ({
        repeatCell: {
          range: {
            sheetId: sheet.properties.sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.12, green: 0.22, blue: 0.38 }, // Slate/Navy
              textFormat: {
                foregroundColor: { red: 1, green: 1, blue: 1 },
                bold: true,
                fontSize: 10,
              },
              horizontalAlignment: 'CENTER',
              verticalAlignment: 'MIDDLE',
            },
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
        },
      }));

      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ requests }),
        }
      );
    }
  } catch (err) {
    console.warn('Formatting headers non-critical warning:', err);
  }
}

/**
 * Helper to fetch values from a sheet tab with multiple URL encoding fallbacks
 */
async function fetchSheetValues(
  accessToken: string,
  spreadsheetId: string,
  tabTitle: string
): Promise<string[][]> {
  const rangesToTry = [
    encodeURIComponent(`'${tabTitle}'!A1:Z`),
    encodeURIComponent(`${tabTitle}!A1:Z`),
    encodeURIComponent(tabTitle),
  ];

  for (const range of rangesToTry) {
    try {
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.values && Array.isArray(data.values) && data.values.length > 0) {
          return data.values as string[][];
        }
      }
    } catch (err) {
      console.warn(`Fetch range ${range} failed:`, err);
    }
  }
  return [];
}

/**
 * Fetch department names from the 'DS Phòng Ban' tab in Google Sheets.
 * Reads Column B (header 'Tên Phòng Ban' at B1, values from B2 onwards).
 */
export async function fetchDepartmentsFromSheet(
  accessToken: string,
  spreadsheetId: string
): Promise<string[]> {
  try {
    // 0. Fetch spreadsheet metadata to get exact tab title
    let tabTitle = DEPARTMENTS_SHEET_NAME;
    try {
      const metaRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(title))`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (metaRes.ok) {
        const metaData = await metaRes.json();
        const tabNames: string[] = metaData.sheets?.map((s: any) => s.properties?.title as string) || [];
        const matched =
          tabNames.find((t) => t.trim().toLowerCase() === 'ds phòng ban') ||
          tabNames.find((t) => t.trim().toLowerCase() === 'ds phong ban') ||
          tabNames.find((t) => /phòng ban|phong ban|departments?/i.test(t));
        if (matched) {
          tabTitle = matched;
        }
      }
    } catch (metaErr) {
      console.warn('Metadata check for departments tab warning:', metaErr);
    }

    // 1. First, attempt to directly read Column B where B1 = 'Tên Phòng Ban'
    const columnBRanges = [
      encodeURIComponent(`'${tabTitle}'!B1:B500`),
      encodeURIComponent(`'${tabTitle}'!B:B`),
      encodeURIComponent(`${tabTitle}!B:B`),
      encodeURIComponent(`'${tabTitle}'!B2:B500`),
    ];

    let bValues: string[][] = [];
    for (const r of columnBRanges) {
      try {
        const res = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${r}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (res.ok) {
          const json = await res.json();
          if (json.values && Array.isArray(json.values) && json.values.length > 0) {
            bValues = json.values;
            break;
          }
        }
      } catch {
        // try next range
      }
    }

    if (bValues.length > 0) {
      const departments: string[] = [];
      for (const row of bValues) {
        if (!row || row.length === 0) continue;
        const cell = row[0]?.toString().trim() || '';
        if (
          cell &&
          !/^(tên phòng ban|ten phong ban|phòng ban|phong ban|department|bộ phận|tên bộ phận|stt)$/i.test(cell)
        ) {
          departments.push(cell);
        }
      }

      const uniqueDepts = Array.from(new Set(departments));
      if (uniqueDepts.length > 0) {
        return uniqueDepts;
      }
    }

    // 2. Fallback: Fetch full tab values and find column with header 'Tên Phòng Ban' or Column B (index 1)
    const fullRows = await fetchSheetValues(accessToken, spreadsheetId, tabTitle);
    if (fullRows.length > 0) {
      const headerRow = fullRows[0].map((h) => h?.toString().toLowerCase().trim() || '');
      let colIdx = headerRow.findIndex((h) =>
        /tên phòng ban|ten phong ban|phòng ban|phong ban|tên bộ phận|department/i.test(h)
      );

      // If header not found by text, default to column B (index 1) if available, otherwise index 0
      if (colIdx === -1) {
        colIdx = fullRows[0].length > 1 ? 1 : 0;
      }

      const isHeader = /tên phòng ban|ten phong ban|phòng ban|phong ban|department|stt/i.test(
        fullRows[0][colIdx]?.toString().trim() || ''
      );
      const dataRows = isHeader ? fullRows.slice(1) : fullRows;

      const departments = dataRows
        .map((r) => r[colIdx]?.toString().trim() || '')
        .filter(
          (val) =>
            val.length > 0 &&
            !/^(tên phòng ban|ten phong ban|phòng ban|phong ban|department|stt)$/i.test(val)
        );

      const uniqueDepts = Array.from(new Set(departments));
      if (uniqueDepts.length > 0) {
        return uniqueDepts;
      }
    }
  } catch (err) {
    console.error('Lỗi khi đọc danh sách phòng ban từ Google Sheets:', err);
  }

  return [];
}

/**
 * Parses user role text/number into NumericRole (0: Admin, 1: Employee, 2: Manager, 3: Dispatcher, 4: Driver)
 */
export function parseRoleFromSheet(rawRole: any): NumericRole {
  if (rawRole === null || rawRole === undefined) return 1;
  const str = rawRole.toString().trim().toLowerCase();

  // 0. Admin Check
  if (
    str === 'admin' ||
    str === 'administrator' ||
    str === 'superadmin' ||
    str === 'quản trị' ||
    str === 'quan tri' ||
    str === 'quản trị viên' ||
    str === 'quan tri vien' ||
    str.includes('admin') ||
    str === '0'
  ) {
    return 0;
  }

  // 1. Employee Check
  if (
    str === '1' ||
    str === 'nv' ||
    str === 'nhân viên' ||
    str === 'nhan vien' ||
    str.includes('nhân viên') ||
    str.includes('nhan vien') ||
    str.includes('employee') ||
    str.includes('staff')
  ) {
    return 1;
  }

  // 2. Manager Check
  if (
    str === '2' ||
    str === 'tbp' ||
    str === 'tp' ||
    str === 'trưởng phòng' ||
    str === 'trưởng bộ phận' ||
    str.includes('trưởng bộ phận') ||
    str.includes('truong bo phan') ||
    str.includes('trưởng phòng') ||
    str.includes('truong phong') ||
    str.includes('quản lý') ||
    str.includes('quan ly') ||
    str.includes('manager') ||
    str.includes('lead')
  ) {
    return 2;
  }

  // 3. Dispatcher Check
  if (
    str === '3' ||
    str === 'điều phối' ||
    str.includes('điều phối') ||
    str.includes('dieu phoi') ||
    str.includes('dispatcher')
  ) {
    return 3;
  }

  // 4. Driver Check
  if (
    str === '4' ||
    str === 'tài xế' ||
    str.includes('tài xế') ||
    str.includes('tai xe') ||
    str.includes('lái xe') ||
    str.includes('lai xe') ||
    str.includes('driver')
  ) {
    return 4;
  }

  const parsedNum = parseInt(str, 10);
  if (parsedNum >= 0 && parsedNum <= 4) {
    return parsedNum as NumericRole;
  }
  return 1;
}

/**
 * Fetch users and roles from the 'DS User' / 'Danh Sách User' tab in Google Sheets.
 * Columns: Email, Họ Và Tên, Phòng Ban, Vai Trò.
 */
export async function fetchUsersFromSheet(
  accessToken: string,
  spreadsheetId: string
): Promise<SheetUser[]> {
  try {
    let tabTitle = USERS_SHEET_NAME;
    try {
      const metaRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(title))`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (metaRes.ok) {
        const metaData = await metaRes.json();
        const tabNames: string[] = metaData.sheets?.map((s: any) => s.properties?.title as string) || [];
        const matched =
          tabNames.find((t) => t.trim().toLowerCase() === 'danh sách user') ||
          tabNames.find((t) => t.trim().toLowerCase() === 'danh sach user') ||
          tabNames.find((t) => t.trim().toLowerCase() === 'ds user') ||
          tabNames.find((t) => t.trim().toLowerCase() === 'ds_user') ||
          tabNames.find((t) => /danh sách user|danh sach user|ds user|ds_user|danh muc user|ds nguoi dung|users?/i.test(t));
        if (matched) {
          tabTitle = matched;
        }
      }
    } catch (metaErr) {
      console.warn('Metadata check for users tab warning:', metaErr);
    }

    const allRows = await fetchSheetValues(accessToken, spreadsheetId, tabTitle);
    if (!allRows || allRows.length === 0) {
      return [];
    }

    const headerRow = allRows[0].map((h) => h?.toString().toLowerCase().trim() || '');
    const isHeader = headerRow.some((h) =>
      /email|mail|họ và tên|ho va ten|phòng ban|vai trò|chức vụ|role/i.test(h)
    );

    let colEmail = isHeader
      ? headerRow.findIndex((h) => /email|mail|thư điện tử|tài khoản/i.test(h))
      : 0;
    let colName = isHeader
      ? headerRow.findIndex((h) => /họ và tên|ho va ten|họ tên|ho ten|tên|ten|name|user/i.test(h))
      : 1;
    let colDept = isHeader
      ? headerRow.findIndex((h) => /phòng ban|phong ban|bộ phận|bo phan|department/i.test(h))
      : 2;
    let colRole = isHeader
      ? headerRow.findIndex((h) => /vai trò|vai tro|chức vụ|chuc vu|role|quyền|quyen/i.test(h))
      : 3;

    if (colEmail === -1) colEmail = 0;
    if (colName === -1) colName = 1;
    if (colDept === -1) colDept = 2;
    if (colRole === -1) colRole = 3;

    const dataRows = isHeader ? allRows.slice(1) : allRows;

    const users: SheetUser[] = [];
    for (const row of dataRows) {
      if (!row || row.length === 0) continue;
      const rawEmail = colEmail !== -1 && row[colEmail] ? row[colEmail].toString().trim() : '';
      if (!rawEmail) continue;

      const email = rawEmail.toLowerCase();
      // Skip row if it is header repetition
      if (email === 'email' || !email.includes('@')) continue;

      const name = colName !== -1 && row[colName] ? row[colName].toString().trim() : '';
      const department = colDept !== -1 && row[colDept] ? row[colDept].toString().trim() : '';
      const roleStr = colRole !== -1 && row[colRole] ? row[colRole].toString().trim() : 'Nhân viên';
      const numericRole = parseRoleFromSheet(roleStr);

      users.push({
        email,
        name: name || rawEmail.split('@')[0],
        department,
        roleStr,
        numericRole,
        isAdmin: numericRole === 0,
      });
    }

    return users;
  } catch (err) {
    console.error('Lỗi khi đọc danh sách User từ Google Sheets:', err);
    return [];
  }
}

/**
 * Look up a user in the 'DS User' tab by email
 */
export async function lookupUserInSheet(
  accessToken: string,
  spreadsheetId: string,
  email: string
): Promise<SheetUser | null> {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  const users = await fetchUsersFromSheet(accessToken, spreadsheetId);
  return users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
}

/**
 * Load all data (Bookings, Fleet, Drivers, Departments, Users) from Google Sheets tabs.
 * Smartly finds the right tab names and column mappings.
 * If sheets are empty or contain only headers, returns empty arrays.
 */
export async function loadAllFromSheets(
  accessToken: string,
  spreadsheetId: string
): Promise<{
  bookings: Booking[];
  vehicles: Vehicle[];
  drivers: Driver[];
  departments: string[];
  users: SheetUser[];
}> {
  const result: {
    bookings: Booking[];
    vehicles: Vehicle[];
    drivers: Driver[];
    departments: string[];
    users: SheetUser[];
  } = {
    bookings: [],
    vehicles: [],
    drivers: [],
    departments: [],
    users: [],
  };

  try {
    // 0. Fetch spreadsheet metadata to get exact tab names
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(title))`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    let tabNames: string[] = [BOOKINGS_SHEET_NAME, FLEET_SHEET_NAME, DRIVERS_SHEET_NAME];
    if (metaRes.ok) {
      const metaData = await metaRes.json();
      tabNames = metaData.sheets?.map((s: any) => s.properties?.title as string) || tabNames;
    }

    // Determine target tab for Fleet: prioritize exact "Đội Xe Công Ty"
    let fleetTabName =
      tabNames.find((t) => t.trim().toLowerCase() === 'đội xe công ty') ||
      tabNames.find((t) => /đội xe|doi xe/i.test(t)) ||
      tabNames.find((t) => /danh sách xe|bảng xe|danh muc xe/i.test(t)) ||
      tabNames.find((t) => /fleet|vehicles?|xe/i.test(t)) ||
      (tabNames.includes(FLEET_SHEET_NAME) ? FLEET_SHEET_NAME : null);

    // Determine target tab for Bookings
    const bookingTabName =
      tabNames.find((t) => t.trim().toLowerCase() === 'danh sách đặt xe') ||
      tabNames.find((t) => /đặt|chuyến|booking|trip|lệnh/i.test(t)) ||
      (tabNames.includes(BOOKINGS_SHEET_NAME) ? BOOKINGS_SHEET_NAME : null);

    // Determine target tab for Drivers
    const driverTabName =
      tabNames.find((t) => t.trim().toLowerCase() === 'danh sách tài xế') ||
      tabNames.find((t) => /tài xế|lái xe|driver/i.test(t)) ||
      (tabNames.includes(DRIVERS_SHEET_NAME) ? DRIVERS_SHEET_NAME : null);

    // 1. Fetch Fleet Vehicles from tab 'Đội Xe Công Ty'
    if (fleetTabName) {
      let allRows = await fetchSheetValues(accessToken, spreadsheetId, fleetTabName);

      // If empty and there are other tabs, look for another sheet that might hold vehicles
      if (allRows.length === 0) {
        for (const t of tabNames) {
          if (t !== fleetTabName) {
            const candidateRows = await fetchSheetValues(accessToken, spreadsheetId, t);
            if (
              candidateRows.length > 0 &&
              candidateRows[0].some((c) => /biển|plate|dòng xe|mã xe/i.test(c?.toString() || ''))
            ) {
              allRows = candidateRows;
              break;
            }
          }
        }
      }

      if (allRows.length > 0) {
        const headerRow = allRows[0].map((h) => h?.toString().toLowerCase().trim() || '');
        const isHeader = headerRow.some((h) =>
          /mã xe|ma xe|biển|plate|dòng xe|model|phân loại|số chỗ|nhiên liệu|odo|trạng thái/i.test(h)
        );

        const dataRows = isHeader ? allRows.slice(1) : allRows;

        // Map the 8 exact columns requested:
        // 1. Mã Xe
        let colCode = isHeader
          ? headerRow.findIndex((h) => /mã xe|ma xe|mã số|code|id xe|veh id|mã/i.test(h))
          : 0;
        // 2. Biển Số
        let colPlate = isHeader
          ? headerRow.findIndex((h) => /biển số|bien so|biển|plate|bks|biển kiểm soát/i.test(h))
          : 1;
        // 3. Dòng Xe
        let colModel = isHeader
          ? headerRow.findIndex((h) => /dòng xe|dong xe|dòng|model|hiệu xe|hãng xe|tên xe/i.test(h))
          : 2;
        // 4. Phân Loại
        let colType = isHeader
          ? headerRow.findIndex((h) => /phân loại|phan loai|phân khúc|hạng xe|loại xe|category|chủng loại/i.test(h))
          : 3;
        // 5. Số Chỗ
        let colSeats = isHeader
          ? headerRow.findIndex((h) => /số chỗ|so cho|chỗ ngồi|chỗ|ghế|seats/i.test(h))
          : 4;
        // 6. Nhiên Liệu
        let colFuel = isHeader
          ? headerRow.findIndex((h) => /nhiên liệu|nhien lieu|năng lượng|fuel/i.test(h))
          : 5;
        // 7. Số ODO
        let colOdo = isHeader
          ? headerRow.findIndex((h) => /số odo|so odo|odo|km|số km|so km|công tơ mét|mileage/i.test(h))
          : 6;
        // 8. Trạng Thái
        let colStatus = isHeader
          ? headerRow.findIndex((h) => /trạng thái|trang thai|tình trạng|status/i.test(h))
          : 7;

        // Additional optional columns
        let colEco = isHeader
          ? headerRow.findIndex((h) => /tiêu hao|định mức|tiêu thụ|economy/i.test(h))
          : 8;
        let colYear = isHeader
          ? headerRow.findIndex((h) => /năm|year/i.test(h))
          : 9;

        // Smart fallbacks if column not located by header text
        if (colCode === -1 && colPlate !== 0) colCode = 0;
        if (colPlate === -1) colPlate = colCode === 0 ? 1 : 0;
        if (colModel === -1) colModel = colPlate === 0 ? 1 : 2;
        if (colType === -1) colType = 3;
        if (colSeats === -1) colSeats = 4;
        if (colFuel === -1) colFuel = 5;
        if (colOdo === -1) colOdo = 6;
        if (colStatus === -1) colStatus = 7;

        result.vehicles = dataRows
          .filter((r) => r.length > 0 && r.some((c) => c && c.toString().trim() !== ''))
          .map((r, idx) => {
            // 1. Mã Xe
            const rawCode = colCode !== -1 && r[colCode] ? r[colCode].toString().trim() : '';
            const code = rawCode || `XE-${String(idx + 1).padStart(2, '0')}`;

            // 2. Biển Số
            const rawPlate = colPlate !== -1 && r[colPlate] ? r[colPlate].toString().trim() : '';
            const plateNumber = rawPlate || (rawCode && rawCode.includes('-') ? rawCode : `XE-${idx + 1}`);

            // 3. Dòng Xe
            const model = (colModel !== -1 && r[colModel]?.toString().trim()) || 'Xe Công Ty';

            // 4. Phân Loại
            const rawType = colType !== -1 && r[colType] ? r[colType].toString().trim() : '';
            let type: VehicleType = 'suv_7';
            if (REVERSE_VEHICLE_TYPE_MAP[rawType]) {
              type = REVERSE_VEHICLE_TYPE_MAP[rawType];
            } else if (/16|van|solati|transit|minibus/i.test(rawType + ' ' + model)) {
              type = 'van_16';
            } else if (/sedan|4 chỗ|5 chỗ|camry|vios|accent|mazda|cerato|k3|civic/i.test(rawType + ' ' + model)) {
              type = 'sedan_4';
            } else if (/bán tải|pickup|ranger|hilux|triton|d-max|navara/i.test(rawType + ' ' + model)) {
              type = 'pickup';
            } else if (
              /suv|7 chỗ|crossover|cuv|mpv|everest|innova|fortuner|vf8|vf9|carnival|custin|santa/i.test(
                rawType + ' ' + model
              )
            ) {
              type = 'suv_7';
            }

            // 5. Số Chỗ
            let seats = type === 'van_16' ? 16 : type === 'sedan_4' ? 5 : type === 'pickup' ? 5 : 7;
            if (colSeats !== -1 && r[colSeats]) {
              const parsedSeats = parseInt(r[colSeats].toString().replace(/[^0-9]/g, ''), 10);
              if (!isNaN(parsedSeats) && parsedSeats > 0) {
                seats = parsedSeats;
              }
            }

            // 6. Nhiên Liệu
            const fuelRaw = colFuel !== -1 && r[colFuel] ? r[colFuel].toString().trim() : '';
            let fuelType: 'Xăng' | 'Dầu' | 'Điện' = 'Xăng';
            if (/điện|electric|ev|kwh|pin/i.test(fuelRaw + ' ' + model)) {
              fuelType = 'Điện';
            } else if (/dầu|diesel/i.test(fuelRaw + ' ' + model)) {
              fuelType = 'Dầu';
            } else if (/xăng|petrol|gas/i.test(fuelRaw)) {
              fuelType = 'Xăng';
            } else if (/vf|vinfast|taycan|ioniq/i.test(model)) {
              fuelType = 'Điện';
            } else if (/transit|solati|ranger|hilux|everest|d-max/i.test(model)) {
              fuelType = 'Dầu';
            }

            // 7. Số ODO
            let currentMileage = 0;
            if (colOdo !== -1 && r[colOdo]) {
              const cleanOdo = r[colOdo].toString().replace(/[^\d.,]/g, '');
              let parsed = 0;
              if (cleanOdo.includes(',') && !cleanOdo.includes('.')) {
                parsed = parseFloat(cleanOdo.replace(/,/g, ''));
              } else if (cleanOdo.includes('.') && cleanOdo.split('.')[1]?.length === 3) {
                parsed = parseFloat(cleanOdo.replace(/\./g, ''));
              } else {
                parsed = parseFloat(cleanOdo.replace(/,/g, ''));
              }
              if (!isNaN(parsed) && parsed >= 0) {
                currentMileage = parsed;
              }
            }

            // 8. Trạng Thái
            const rawStatus = colStatus !== -1 && r[colStatus] ? r[colStatus].toString().trim() : '';
            let status: VehicleStatus = 'available';
            if (/đang công tác|công tác|đang chạy|đang đi|bận|đang dùng|in_use/i.test(rawStatus)) {
              status = 'in_use';
            } else if (/bảo dưỡng|bảo trì|sửa|hỏng|hư|bảo hành|maintenance/i.test(rawStatus)) {
              status = 'maintenance';
            } else {
              status = 'available';
            }

            const fuelEconomy =
              colEco !== -1 && r[colEco]
                ? r[colEco].toString().trim()
                : fuelType === 'Điện'
                ? '18 kWh / 100km'
                : fuelType === 'Dầu'
                ? '9.0 L / 100km'
                : '8.0 L / 100km';

            const year =
              colYear !== -1 && r[colYear]
                ? parseInt(r[colYear].toString().replace(/[^0-9]/g, ''), 10) || 2023
                : 2023;

            return {
              id: `veh_${code.replace(/[^a-zA-Z0-9_-]/g, '_')}_${plateNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
              code,
              plateNumber,
              model,
              type,
              seats,
              fuelType,
              currentMileage,
              status,
              color: 'Tiêu chuẩn',
              fuelEconomy,
              year,
            };
          });
      }
    }

    // 0b. Fetch Users from tab 'DS User' upfront
    try {
      const fetchedUsers = await fetchUsersFromSheet(accessToken, spreadsheetId);
      if (fetchedUsers && fetchedUsers.length > 0) {
        result.users = fetchedUsers;
      }
    } catch (uErr) {
      console.warn('Lỗi khi tải DS User trong loadAllFromSheets:', uErr);
    }

    // 2. Fetch Bookings
    if (bookingTabName) {
      const allRows = await fetchSheetValues(accessToken, spreadsheetId, bookingTabName);

      if (allRows.length > 0) {
        const headerRow = allRows[0].map((h) => h?.toString().toLowerCase().trim() || '');
        const isHeader = headerRow.some((h) => /mã phiếu|trạng thái|người|mục đích/i.test(h));
        const dataRows = isHeader ? allRows.slice(1) : allRows;

        // Check if there is an explicit Email column in Bookings sheet
        const colEmail = isHeader
          ? headerRow.findIndex((h) => /email|mail|thư điện tử|tài khoản/i.test(h))
          : -1;

        result.bookings = dataRows
          .filter((r) => r.length > 0 && r.some((c) => c && c.toString().trim() !== ''))
          .map((r, idx) => {
            const code = r[0]?.toString().trim() || `BK-${idx + 1}`;
            const rawStatus = r[1]?.toString().trim() || '';
            const status: BookingStatus =
              REVERSE_STATUS_MAP[rawStatus] || (rawStatus as BookingStatus) || 'pending_manager';
            const requesterName = r[2]?.toString().trim() || 'Nhân viên';
            const department = r[3]?.toString().trim() || 'Phòng Ban';
            const requesterPhone = r[4]?.toString().trim() || '';
            const purpose = r[5]?.toString().trim() || 'Công tác';
            const pickupLocation = r[6]?.toString().trim() || 'Trụ sở công ty';
            const destination = r[7]?.toString().trim() || 'Điểm đến công tác';
            const departureTime = r[8]?.toString().trim() || new Date().toISOString();
            const returnTime =
              r[9]?.toString().trim() === 'Một chiều' || !r[9]?.toString().trim()
                ? undefined
                : r[9].toString().trim();
            const tripType: TripType = r[10]?.toString().trim() === 'Một chiều' ? 'one-way' : 'round-trip';
            const rawVehType = r[11]?.toString().trim() || '';
            const vehicleTypeNeeded: VehicleType =
              REVERSE_VEHICLE_TYPE_MAP[rawVehType] || (rawVehType as VehicleType) || 'suv_7';
            const passengerCount = parseInt(r[15]?.toString().trim() || '1', 10) || 1;
            const estimatedDistanceKm = parseFloat(r[16]?.toString().trim() || '0') || 0;
            const actualDistanceKm = r[17]?.toString().trim() ? parseFloat(r[17].toString().trim()) : undefined;
            const tollFee = parseFloat(r[18]?.toString().trim() || '0') || 0;
            const fuelCost = parseFloat(r[19]?.toString().trim() || '0') || 0;
            const notes = r[20]?.toString().trim() || '';
            const createdAt = r[21]?.toString().trim() || new Date().toISOString();

            // Extract email: from explicit column, from notes tag, or matched by user name
            let requesterEmail = colEmail !== -1 && r[colEmail] ? r[colEmail].toString().trim() : '';
            if (!requesterEmail && notes) {
              const noteMatch = notes.match(/\[(?:Email|Mail):\s*([^\]\s]+@[^\]\s]+)\]/i);
              if (noteMatch && noteMatch[1]) {
                requesterEmail = noteMatch[1].trim();
              }
            }
            if (!requesterEmail && result.users.length > 0) {
              const matchedUser = result.users.find(
                (u) => u.name && u.name.trim().toLowerCase() === requesterName.toLowerCase()
              );
              if (matchedUser) {
                requesterEmail = matchedUser.email;
              }
            }

            return {
              id: `bk_${code}_${idx}`,
              code,
              status,
              requesterName,
              requesterEmail,
              requesterPhone,
              department,
              purpose,
              pickupLocation,
              destination,
              departureTime,
              returnTime,
              tripType,
              vehicleTypeNeeded,
              passengerCount,
              priority: 'normal' as Priority,
              notes,
              estimatedDistanceKm,
              estimatedDurationMin: Math.round(estimatedDistanceKm * 2.2),
              actualDistanceKm,
              tollFee,
              fuelCost,
              syncedToSheets: true,
              createdAt,
              updatedAt: createdAt,
            };
          });
      }
    }

    // 3. Fetch Drivers
    if (driverTabName) {
      const allRows = await fetchSheetValues(accessToken, spreadsheetId, driverTabName);

      if (allRows.length > 0) {
        const headerRow = allRows[0].map((h) => h?.toString().toLowerCase().trim() || '');
        const isHeader = headerRow.some((h) => /mã|tên|gplx|hạng/i.test(h));
        const dataRows = isHeader ? allRows.slice(1) : allRows;

        result.drivers = dataRows
          .filter((r) => r.length > 0 && r.some((c) => c && c.toString().trim() !== ''))
          .map((r, idx) => {
            const id = r[0]?.toString().trim() || `drv_${idx + 1}`;
            const name = r[1]?.toString().trim() || `Tài xế ${idx + 1}`;
            const phone = r[2]?.toString().trim() || '';
            const licenseNumber = r[3]?.toString().trim() || '';
            const licenseClass = (r[4]?.toString().trim() || 'B2') as 'B2' | 'C' | 'D' | 'E';
            const experienceYears = parseFloat(r[5]?.toString().trim() || '3') || 3;
            const rating = parseFloat(r[6]?.toString().trim() || '5.0') || 5.0;
            const rawStatus = r[7]?.toString().trim();
            const status =
              rawStatus === 'Đang chạy'
                ? 'busy'
                : rawStatus === 'Nghỉ ca'
                ? 'off_duty'
                : 'active';

            return {
              id,
              name,
              phone,
              licenseNumber,
              licenseClass,
              experienceYears,
              rating,
              status,
            };
          });
      }
    }

    // 4. Fetch Departments from tab 'DS Phòng Ban'
    try {
      const depts = await fetchDepartmentsFromSheet(accessToken, spreadsheetId);
      if (depts && depts.length > 0) {
        result.departments = depts;
      }
    } catch (deptErr) {
      console.warn('Không thể đọc tab DS Phòng Ban:', deptErr);
    }
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu từ Google Sheets:', err);
    throw err;
  }

  return result;
}

/**
 * Sync entire dataset to Google Sheets
 */
export async function syncAllToSheets(
  accessToken: string,
  spreadsheetId: string,
  bookings: Booking[],
  vehicles: Vehicle[],
  drivers: Driver[]
): Promise<void> {
  // 1. Prepare bookings rows
  const bookingRows = bookings.map((b) => {
    const vehicle = vehicles.find((v) => v.id === b.assignedVehicleId);
    const driver = drivers.find((d) => d.id === b.assignedDriverId);

    const savedNotes =
      b.requesterEmail && !b.notes?.includes(b.requesterEmail)
        ? `${b.notes ? b.notes + ' ' : ''}[Email: ${b.requesterEmail}]`
        : b.notes || '';

    return [
      b.code,
      STATUS_LABELS[b.status] || b.status,
      b.requesterName,
      b.department,
      b.requesterPhone,
      b.purpose,
      b.pickupLocation,
      b.destination,
      formatDate(b.departureTime),
      b.returnTime ? formatDate(b.returnTime) : 'Một chiều',
      b.tripType === 'round-trip' ? 'Khứ hồi' : 'Một chiều',
      VEHICLE_TYPE_LABELS[b.vehicleTypeNeeded] || b.vehicleTypeNeeded,
      vehicle?.model || 'Chưa phân',
      vehicle?.plateNumber || 'Chưa phân',
      driver ? `${driver.name} (${driver.phone})` : 'Chưa phân',
      b.passengerCount,
      b.estimatedDistanceKm || 0,
      b.actualDistanceKm || '',
      b.tollFee || 0,
      b.fuelCost || 0,
      savedNotes,
      formatDate(b.createdAt),
    ];
  });

  // 2. Prepare fleet rows
  const fleetRows = vehicles.map((v) => [
    v.code || v.id,
    v.plateNumber,
    v.model,
    VEHICLE_TYPE_LABELS[v.type] || v.type,
    `${v.seats} chỗ`,
    v.fuelType,
    v.currentMileage,
    v.status === 'available' ? 'Sẵn sàng' : v.status === 'in_use' ? 'Đang công tác' : 'Bảo dưỡng',
    v.fuelEconomy || '',
    v.year || '',
  ]);

  // 3. Prepare driver rows
  const driverRows = drivers.map((d) => [
    d.id,
    d.name,
    d.phone,
    d.licenseNumber,
    d.licenseClass,
    d.experienceYears,
    d.rating,
    d.status === 'active' ? 'Sẵn sàng nhận chuyến' : d.status === 'busy' ? 'Đang chạy' : 'Nghỉ ca',
  ]);

  // Clean and write rows
  const bookingRange = encodeURIComponent(`'${BOOKINGS_SHEET_NAME}'!A2:${getColumnLetter(BOOKING_HEADERS.length)}`);
  const clearAndSetBookings = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${bookingRange}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: bookingRows.length > 0 ? bookingRows : [['']],
      }),
    }
  );

  if (!clearAndSetBookings.ok) {
    const err = await clearAndSetBookings.text();
    throw new Error(`Đồng bộ danh sách đặt xe thất bại: ${err}`);
  }

  // Update fleet sheet
  const fleetRange = encodeURIComponent(`'${FLEET_SHEET_NAME}'!A2:${getColumnLetter(FLEET_HEADERS.length)}`);
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${fleetRange}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: fleetRows.length > 0 ? fleetRows : [['']],
      }),
    }
  );

  // Update drivers sheet
  const driverRange = encodeURIComponent(`'${DRIVERS_SHEET_NAME}'!A2:${getColumnLetter(DRIVER_HEADERS.length)}`);
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${driverRange}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: driverRows.length > 0 ? driverRows : [['']],
      }),
    }
  );
}

/**
 * Append a newly submitted booking directly as a row in Google Sheets
 */
export async function appendBookingToSheet(
  accessToken: string,
  spreadsheetId: string,
  booking: Booking,
  vehicle?: Vehicle,
  driver?: Driver
): Promise<boolean> {
  try {
    const savedNotes =
      booking.requesterEmail && !booking.notes?.includes(booking.requesterEmail)
        ? `${booking.notes ? booking.notes + ' ' : ''}[Email: ${booking.requesterEmail}]`
        : booking.notes || '';

    const row = [
      booking.code,
      STATUS_LABELS[booking.status] || booking.status,
      booking.requesterName,
      booking.department,
      booking.requesterPhone,
      booking.purpose,
      booking.pickupLocation,
      booking.destination,
      formatDate(booking.departureTime),
      booking.returnTime ? formatDate(booking.returnTime) : 'Một chiều',
      booking.tripType === 'round-trip' ? 'Khứ hồi' : 'Một chiều',
      VEHICLE_TYPE_LABELS[booking.vehicleTypeNeeded] || booking.vehicleTypeNeeded,
      vehicle?.model || 'Chưa phân',
      vehicle?.plateNumber || 'Chưa phân',
      driver ? `${driver.name} (${driver.phone})` : 'Chưa phân',
      booking.passengerCount,
      booking.estimatedDistanceKm || 0,
      booking.actualDistanceKm || '',
      booking.tollFee || 0,
      booking.fuelCost || 0,
      savedNotes,
      formatDate(booking.createdAt),
    ];

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${BOOKINGS_SHEET_NAME}'!A:V:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [row],
        }),
      }
    );

    return res.ok;
  } catch (err) {
    console.error('Lỗi khi ghi dòng vào Google Sheet:', err);
    return false;
  }
}

/**
 * Verifies if a spreadsheet exists and user has access
 */
export async function getSpreadsheetInfo(
  accessToken: string,
  spreadsheetId: string
): Promise<{ title: string; url: string; sheets: string[] }> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,spreadsheetUrl,sheets.properties.title`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Không thể truy cập Google Sheet (${spreadsheetId}): ${text}`);
  }

  const data = await res.json();
  return {
    title: data.properties?.title || 'Google Sheet',
    url: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    sheets: data.sheets?.map((s: any) => s.properties?.title) || [],
  };
}

function getColumnLetter(colIndex: number): string {
  let temp = colIndex;
  let letter = '';
  while (temp > 0) {
    const rem = (temp - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    temp = Math.floor((temp - 1) / 26);
  }
  return letter || 'A';
}

function formatDate(isoString: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}
