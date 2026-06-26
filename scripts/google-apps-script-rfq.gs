/**
 * Google Apps Script — RFQ → Google Sheet (+ Telegram tuỳ chọn)
 *
 * Deploy: Web app → Execute as: Me → Anyone can access → New version
 */
const SPREADSHEET_ID = 'PASTE_SHEET_ID_HERE';
const SHEET_NAME = 'RFQ';
const TELEGRAM_BOT_TOKEN = '';
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

      items.push({
        name: maskName_(row[2]),
        product: String(row[3] || '').trim() || 'hộp Trung Thu',
        qty: qtyFromRow_(qtyDetail, qtyTierLabel),
        type: 'rfq',
        note: needLabel || note || 'Báo giá',
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

function notifyTelegram_(data) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  const lines = [
    '📩 RFQ hopqua.github.io',
    data.phone ? `SĐT: ${data.phone}` : '',
    data.name ? `Tên: ${data.name}` : '',
    data.productName ? `Mẫu: ${data.productName}` : '',
    data.needLabel || data.need ? `Nhu cầu: ${data.needLabel || data.need}` : '',
    data.qtyTierLabel || data.qtyTier
      ? `SL: ${data.qtyTierLabel || data.qtyTier}${data.qtyDetail ? ' (' + data.qtyDetail + ')' : ''}`
      : '',
    data.note ? `Ghi chú: ${data.note}` : '',
  ].filter(Boolean);
  const text = lines.join('\n');
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200) {
    Logger.log('Telegram RFQ lỗi: ' + res.getContentText());
  }
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
    pageUrl: 'https://hopqua.github.io/',
  };
  appendRow_(data);
  notifyTelegram_(data);
}
