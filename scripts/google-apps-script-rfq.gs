/**
 * Google Apps Script — RFQ → Google Sheet (+ Telegram)
 *
 * Deploy:
 * 1. Sheet tab tên "RFQ"
 * 2. Dán TOÀN BỘ file này → Save (đừng chỉ sửa TELEGRAM_CHAT_IDS rồi giữ notifyTelegram_ cũ)
 * 3. Deploy → Manage deployments → Edit → Version: New version
 *    Execute as: Me | Who has access: Anyone
 * 4. Chạy testTelegramOnly → Executions phải ok: true
 *
 * LỖI THƯỜNG GẶP: notifyTelegram_ cũ có dòng
 *   if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
 * TELEGRAM_CHAT_ID = '' → Telegram KHÔNG BAO GIỜ GỬI dù TELEGRAM_CHAT_IDS đã điền.
 */
const SPREADSHEET_ID = 'PASTE_SHEET_ID_HERE';
const SHEET_NAME = 'RFQ';
const TELEGRAM_BOT_TOKEN = '';
/** Một hoặc nhiều chat (cá nhân hoặc nhóm -100...). Ưu tiên hơn TELEGRAM_CHAT_ID. */
const TELEGRAM_CHAT_IDS = [
  // '1189117330',
];
/** Giữ tương thích cũ — chỉ dùng nếu TELEGRAM_CHAT_IDS rỗng */
const TELEGRAM_CHAT_ID = '';

const RFQ_KEYS = [
  'phone', 'name', 'productId', 'productName', 'need', 'needLabel',
  'qtyTier', 'qtyTierLabel', 'qtyDetail', 'note', 'pageUrl', 'submittedAt', 'source',
];

function parseUrlEncoded_(raw) {
  const out = {};
  String(raw || '')
    .split('&')
    .forEach((pair) => {
      if (!pair) return;
      const eq = pair.indexOf('=');
      const k = decodeURIComponent((eq >= 0 ? pair.slice(0, eq) : pair).replace(/\+/g, ' '));
      const v = decodeURIComponent((eq >= 0 ? pair.slice(eq + 1) : '').replace(/\+/g, ' '));
      out[k] = v;
    });
  return out;
}

function mergeFlat_(target, source) {
  const out = Object.assign({}, target || {});
  RFQ_KEYS.forEach((key) => {
    const val = source && source[key];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      out[key] = String(val).trim();
    }
  });
  return out;
}

function parsePayload_(e) {
  if (!e) return {};
  const param = e.parameter || {};
  let data = {};

  const contents = (e.postData && e.postData.contents) || '';
  if (contents) {
    const trimmed = contents.trim();
    try {
      if (trimmed.charAt(0) === '{' || trimmed.charAt(0) === '[') {
        data = JSON.parse(trimmed);
      } else {
        const params = parseUrlEncoded_(trimmed);
        if (params.payload) {
          try {
            data = JSON.parse(params.payload);
          } catch (err) {
            Logger.log('parse payload in postData: ' + err);
          }
        }
        data = mergeFlat_(data, params);
      }
    } catch (err2) {
      Logger.log('parse postData: ' + err2);
    }
  }

  if (param.payload) {
    try {
      const fromPayload = JSON.parse(param.payload);
      data = Object.assign(fromPayload || {}, data);
    } catch (err3) {
      Logger.log('parse param.payload: ' + err3);
    }
  }

  data = mergeFlat_(data, param);
  return data || {};
}

function doPost(e) {
  try {
    const data = parsePayload_(e);
    if (!data.phone) {
      throw new Error('Thiếu SĐT trong request RFQ');
    }
    appendRow_(data);
    notifyTelegram_(data);
    return ContentService.createTextOutput(JSON.stringify({ ok: true, phone: data.phone }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const param = (e && e.parameter) || {};
  if (param.feed === 'activity') {
    const limit = param.limit || 20;
    const payload = getActivityFeed_(limit);
    return ContentService.createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput('RFQ endpoint OK').setMimeType(ContentService.MimeType.TEXT);
}

function maskName_(name) {
  const s = String(name || '').trim();
  if (!s) return 'Khách mới';
  return s.split(/\s+/)[0];
}

function qtyFromRow_(qtyDetail, qtyTierLabel) {
  const detail = parseInt(String(qtyDetail || '').trim(), 10);
  if (detail > 0) return detail;
  const tier = String(qtyTierLabel || '');
  if (tier.indexOf('500') >= 0 && tier.indexOf('+') >= 0) return 500;
  if (tier.indexOf('100') >= 0) return 200;
  if (tier.indexOf('11') >= 0) return 50;
  return 10;
}

const TEST_PHONES_ = ['0900000099', '0900000098', '0900000097', '0900000096', '0900000095', '0900000094', '0900000093'];

function getActivityFeed_(limit) {
  const max = Math.min(parseInt(limit, 10) || 20, 30);
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sh = ss.getSheetByName(SHEET_NAME);
    if (!sh || sh.getLastRow() < 2) return { items: [] };

    const lastRow = sh.getLastRow();
    const startRow = Math.max(2, lastRow - max + 1);
    const rows = sh.getRange(startRow, 1, lastRow, 11).getValues();
    const items = [];

    for (let i = rows.length - 1; i >= 0; i--) {
      const row = rows[i];
      const phone = String(row[1] || '').trim();
      if (!phone || TEST_PHONES_.indexOf(phone) >= 0) continue;

      const qtyDetail = row[7];
      const qtyTierLabel = row[6];
      const needLabel = String(row[5] || '').trim();
      const note = String(row[8] || '').trim();

      const productName = String(row[3] || '').trim();
      items.push({
        name: maskName_(row[2]),
        product: productName,
        needLabel: needLabel || 'Báo giá sỉ',
        qtyTierLabel: String(qtyTierLabel || '').trim(),
        qtyDetail: qtyDetail ? String(qtyDetail).trim() : '',
        note: String(note || '').trim(),
        qty: qtyFromRow_(qtyDetail, qtyTierLabel),
        type: 'rfq',
        real: true,
      });
    }
    return { items: items };
  } catch (err) {
    Logger.log('getActivityFeed_: ' + err);
    return { items: [] };
  }
}

function appendRow_(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  const headerRow = ['thời gian', 'SĐT', 'tên', 'mẫu', 'id mẫu', 'nhu cầu', 'SL khoảng', 'SL cụ thể', 'ghi chú', 'URL', 'trạng thái'];
  if (sh.getLastRow() === 0) {
    sh.appendRow(headerRow);
  } else {
    const firstCell = String(sh.getRange(1, 1).getValue() || '').trim();
    if (firstCell !== 'thời gian') {
      sh.insertRowBefore(1);
      sh.getRange(1, 1, 1, headerRow.length).setValues([headerRow]);
    }
  }
  sh.appendRow([
    data.submittedAt || new Date().toISOString(),
    data.phone || '',
    data.name || '',
    data.productName || '',
    data.productId || '',
    data.needLabel || data.need || '',
    data.qtyTierLabel || data.qtyTier || '',
    data.qtyDetail || '',
    data.note || '',
    data.pageUrl || '',
    'mới',
  ]);
}

function formatQtyTelegram_(data) {
  const tier = data.qtyTierLabel || data.qtyTier || '';
  const detail = data.qtyDetail ? String(data.qtyDetail).trim() : '';
  if (!tier && !detail) return '';
  if (tier && detail) return tier + ' (' + detail + ' cái)';
  return tier || detail + ' cái';
}

function getTelegramChatIds_() {
  const ids = (TELEGRAM_CHAT_IDS || []).filter(function (id) {
    return id !== undefined && id !== null && String(id).trim() !== '';
  });
  if (ids.length) return ids.map(String);
  if (TELEGRAM_CHAT_ID) return [String(TELEGRAM_CHAT_ID)];
  return [];
}

function sendTelegramMessage_(text) {
  if (!TELEGRAM_BOT_TOKEN) {
    return [{ chatId: '', ok: false, error: 'Thiếu TELEGRAM_BOT_TOKEN' }];
  }
  const chatIds = getTelegramChatIds_();
  if (!chatIds.length) {
    return [{ chatId: '', ok: false, error: 'Thiếu TELEGRAM_CHAT_IDS hoặc TELEGRAM_CHAT_ID' }];
  }
  const url = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';
  return chatIds.map(function (chatId) {
    const res = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ chat_id: chatId, text: text }),
      muteHttpExceptions: true,
    });
    const ok = res.getResponseCode() === 200;
    const body = res.getContentText();
    if (!ok) Logger.log('Telegram lỗi chat ' + chatId + ': ' + body);
    return { chatId: chatId, ok: ok, response: body };
  });
}

function notifyTelegram_(data) {
  const need = data.needLabel || data.need || 'Báo giá sỉ';
  const qtyLine = formatQtyTelegram_(data);
  const lines = [
    '📩 Yêu cầu mới · hopqua.io.vn',
    '',
    data.phone ? '📞 ' + data.phone : '',
    data.name ? '👤 ' + data.name : '',
    data.productName ? '📦 ' + data.productName : '',
    '🎯 ' + need,
    qtyLine ? '📊 SL: ' + qtyLine : '',
    data.note ? '📝 ' + data.note : '',
    data.pageUrl ? '🔗 ' + data.pageUrl : '',
  ].filter(Boolean);
  sendTelegramMessage_(lines.join('\n'));
}

/** Chạy trong Apps Script để test Telegram (không ghi Sheet). Xem Execution log. */
function testTelegramOnly() {
  const results = sendTelegramMessage_(
    '✅ Test Telegram hopqua.io.vn — ' + new Date().toISOString()
  );
  Logger.log(JSON.stringify(results, null, 2));
}

function testRfq() {
  const data = {
    submittedAt: new Date().toISOString(),
    phone: '0900000099',
    name: 'Test GAS',
    productName: 'Test mẫu',
    needLabel: 'Báo giá sỉ',
    qtyTierLabel: '1–10 cái',
    note: 'Test thủ công trong Apps Script',
    pageUrl: 'https://hopqua.io.vn/',
  };
  appendRow_(data);
  notifyTelegram_(data);
}
