const API_SECRET = '12345';
const SHEET_ID = '1i-jp2-d2662iWm5l_IJp8UFHHH1z9dqjmWJp1laUFkc';
const ADMIN_SHEET_NAME = 'Admin';
const CEMENT_SHEET_NAME = 'Cement';
const STEEL_SHEET_NAME = 'Steel';
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const ADMIN_HEADERS = [
  'Name',
  'Email',
  'Password',
  'Role',
  'Status',
  'Created At',
  'Approved By',
  'Approved At',
  'Auth Token',
  'Token Created At',
  'Token Expires At',
];

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    if (payload.secret !== API_SECRET) {
      return jsonResponse_(false, 'Invalid API secret.');
    }

    switch (payload.action) {
      case 'login':
        return handleLogin_(payload);
      case 'validateToken':
        return handleValidateToken_(payload);
      case 'logout':
        return handleLogout_(payload);
      case 'registerUser':
        return handleRegisterUser_(payload);
      case 'listUsers':
        return handleListUsers_(payload);
      case 'approveUser':
        return handleApproveUser_(payload);
      case 'rejectUser':
        return handleRejectUser_(payload);
      case 'updateRates':
        return handleUpdateRates_(payload);
      default:
        return jsonResponse_(false, 'Unknown action.');
    }
  } catch (error) {
    return jsonResponse_(false, error.message || 'Unexpected server error.');
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);

    const cementSheet = ss.getSheetByName('Cement');
    const steelSheet = ss.getSheetByName('Steel');

    const cementData = cementSheet
      .getRange('A2:B')
      .getValues()
      .filter(function (r) {
        return r[0];
      });

    const steelData = steelSheet
      .getRange('A2:B')
      .getValues()
      .filter(function (r) {
        return r[0];
      });

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        cement: cementData.map(function (r) {
          return { item: r[0], price: r[1] };
        }),
        steel: steelData.map(function (r) {
          return { item: r[0], price: r[1] };
        }),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: err.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function jsonResponse_(success, message, extra) {
  return ContentService.createTextOutput(
    JSON.stringify(
      Object.assign(
        {
          success: success,
          message: message,
        },
        extra || {}
      )
    )
  ).setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheet_() {
  return SpreadsheetApp.openById(SHEET_ID);
}

function getSheet_(sheetName) {
  const sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('Missing sheet: ' + sheetName);
  }
  return sheet;
}

function ensureAdminSheet_() {
  const sheet = getSheet_(ADMIN_SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(ADMIN_HEADERS);
  } else {
    sheet.getRange(1, 1, 1, ADMIN_HEADERS.length).setValues([ADMIN_HEADERS]);
  }
  return sheet;
}

function getAdminRecords_() {
  const sheet = ensureAdminSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }

  const rows = sheet
    .getRange(2, 1, lastRow - 1, ADMIN_HEADERS.length)
    .getValues();

  return rows.map(function (row, index) {
    return {
      rowIndex: index + 2,
      name: row[0],
      email: row[1],
      password: row[2],
      role: row[3],
      status: row[4],
      createdAt: row[5],
      approvedBy: row[6],
      approvedAt: row[7],
      authToken: row[8],
      tokenCreatedAt: row[9],
      tokenExpiresAt: row[10],
    };
  });
}

function findAdminByEmail_(email) {
  const normalized = String(email || '').trim().toLowerCase();
  return getAdminRecords_().find(function (record) {
    return String(record.email || '').trim().toLowerCase() === normalized;
  });
}

function findAdminByToken_(token) {
  const normalized = String(token || '').trim();
  if (!normalized) {
    return null;
  }
  return getAdminRecords_().find(function (record) {
    return String(record.authToken || '').trim() === normalized;
  });
}

function serializeUser_(record) {
  return {
    name: record.name,
    email: record.email,
    role: record.role,
    status: record.status,
  };
}

function clearTokenFields_(sheet, rowIndex) {
  sheet.getRange(rowIndex, 9, 1, 3).setValues([['', '', '']]);
}

function requireValidToken_(token) {
  const record = findAdminByToken_(token);
  if (!record) {
    throw new Error('Session expired. Please login again.');
  }

  if (String(record.status || '').toLowerCase() !== 'active') {
    throw new Error('Session expired. Please login again.');
  }

  const expiresAt = record.tokenExpiresAt ? new Date(record.tokenExpiresAt).getTime() : 0;
  if (!expiresAt || expiresAt < Date.now()) {
    clearTokenFields_(ensureAdminSheet_(), record.rowIndex);
    throw new Error('Session expired. Please login again.');
  }

  return record;
}

function requireOwnerByToken_(token) {
  const record = requireValidToken_(token);
  if (String(record.role || '').toLowerCase() !== 'owner') {
    throw new Error('Only owner can perform this action.');
  }
  return record;
}

function handleLogin_(payload) {
  const email = String(payload.email || '').trim().toLowerCase();
  const password = String(payload.password || '');
  if (!email || !password) {
    return jsonResponse_(false, 'Email and password are required.');
  }

  const admin = findAdminByEmail_(email);
  if (!admin || String(admin.password || '') !== password) {
    return jsonResponse_(false, 'Invalid login details.');
  }

  if (String(admin.status || '').toLowerCase() === 'pending') {
    return jsonResponse_(false, 'Your account is pending owner approval.', {
      status: 'pending',
    });
  }

  if (String(admin.status || '').toLowerCase() !== 'active') {
    return jsonResponse_(false, 'Your account is not active.', {
      status: admin.status,
    });
  }

  const token = Utilities.getUuid();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + TOKEN_TTL_MS);
  const sheet = ensureAdminSheet_();
  sheet
    .getRange(admin.rowIndex, 9, 1, 3)
    .setValues([[token, createdAt, expiresAt]]);

  return jsonResponse_(true, 'Login successful.', {
    token: token,
    user: serializeUser_(Object.assign({}, admin, {
      authToken: token,
      tokenCreatedAt: createdAt,
      tokenExpiresAt: expiresAt,
    })),
  });
}

function handleValidateToken_(payload) {
  try {
    const admin = requireValidToken_(payload.token);
    return jsonResponse_(true, 'Token valid.', {
      user: serializeUser_(admin),
    });
  } catch (error) {
    return jsonResponse_(false, error.message || 'Invalid token.');
  }
}

function handleLogout_(payload) {
  const admin = findAdminByToken_(payload.token);
  if (!admin) {
    return jsonResponse_(true, 'Logout successful.');
  }

  clearTokenFields_(ensureAdminSheet_(), admin.rowIndex);
  return jsonResponse_(true, 'Logout successful.');
}

function handleRegisterUser_(payload) {
  const user = payload.user || {};
  const email = String(user.email || '').trim().toLowerCase();
  if (!String(user.name || '').trim() || !email || !String(user.password || '').trim()) {
    return jsonResponse_(false, 'Incomplete registration details.');
  }

  if (findAdminByEmail_(email)) {
    return jsonResponse_(false, 'User already exists.');
  }

  ensureAdminSheet_().appendRow([
    String(user.name || '').trim(),
    email,
    String(user.password || ''),
    'editor',
    'pending',
    new Date(),
    '',
    '',
    '',
    '',
    '',
  ]);

  return jsonResponse_(true, 'Registration submitted successfully.');
}

function handleListUsers_(payload) {
  requireOwnerByToken_(payload.token);
  const users = getAdminRecords_().map(function (record) {
    return {
      name: record.name,
      email: record.email,
      role: record.role,
      status: record.status,
      createdAt: record.createdAt,
      approvedBy: record.approvedBy,
      approvedAt: record.approvedAt,
    };
  });
  return jsonResponse_(true, 'Users loaded.', {
    users: users,
  });
}

function handleApproveUser_(payload) {
  const owner = requireOwnerByToken_(payload.token);
  const targetEmail = String(payload.targetEmail || '').trim().toLowerCase();
  const nextRole = String(payload.role || 'editor').trim().toLowerCase();
  const nextStatus = String(payload.status || 'active').trim().toLowerCase();
  const target = findAdminByEmail_(targetEmail);

  if (!target) {
    return jsonResponse_(false, 'User not found.');
  }

  const allowedRole = nextRole === 'owner' ? 'owner' : 'editor';
  const allowedStatus =
    ['pending', 'active', 'inactive', 'rejected'].indexOf(nextStatus) >= 0
      ? nextStatus
      : 'active';

  ensureAdminSheet_()
    .getRange(target.rowIndex, 4, 1, 5)
    .setValues([[
      allowedRole,
      allowedStatus,
      target.createdAt || new Date(),
      owner.email,
      new Date(),
    ]]);

  return jsonResponse_(true, 'User updated successfully.');
}

function handleRejectUser_(payload) {
  const owner = requireOwnerByToken_(payload.token);
  const targetEmail = String(payload.targetEmail || '').trim().toLowerCase();
  const target = findAdminByEmail_(targetEmail);

  if (!target) {
    return jsonResponse_(false, 'User not found.');
  }

  ensureAdminSheet_()
    .getRange(target.rowIndex, 5, 1, 4)
    .setValues([[
      'rejected',
      target.createdAt || new Date(),
      owner.email,
      new Date(),
    ]]);
  clearTokenFields_(ensureAdminSheet_(), target.rowIndex);

  return jsonResponse_(true, 'User rejected successfully.');
}

function handleUpdateRates_(payload) {
  requireValidToken_(payload.token);
  writeRates_(CEMENT_SHEET_NAME, payload.cement || []);
  writeRates_(STEEL_SHEET_NAME, payload.steel || []);
  return jsonResponse_(true, 'Rates updated successfully.');
}

function writeRates_(sheetName, items) {
  const sheet = getSheet_(sheetName);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, 2).setValues([['Item', 'Price']]);

  const rows = items.map(function (item) {
    return [String(item.item || ''), Number(item.price || 0)];
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  }
}
