/**
 * Google Apps Script — RFQ → Google Sheet (+ Telegram tuỳ chọn)
 *
 * Cách deploy:
 * 1. Tạo Google Sheet, thêm sheet "RFQ" với hàng 1:
 *    thời gian | SĐT | tên | mẫu | id mẫu | nhu cầu | SL khoảng | SL cụ thể | ghi chú | URL | trạng thái
 * 2. Extensions → Apps Script → dán file này
 * 3. Đặt SPREADSHEET_ID, (tuỳ chọn) TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID
 *    (chỉ sửa trên console Apps Script — KHÔNG commit token vào Git)
 * 4. Deploy → New deployment → Web app → Execute as: Me, Anyone can access
 * 5. Copy URL Web app → dán vào data/rfq-config.json → submitUrl
 */
const SPREADSHEET_ID = 'PASTE_SHEET_ID_HERE';
const SHEET_NAME = 'RFQ';
const TELEGRAM_BOT_TOKEN = '';
const TELEGRAM_CHAT_ID = '';

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

function parsePayload_(e) {
  if (!e) return {};
  const param = e.parameter || {};
  let data = {};

  if (param.payload) {
    try {
      data = JSON.parse(param.payload);
    } catch (err) {
      Logger.log('parse payload JSON: ' + err);
    }
  }

  if (!data.phone && param.phone) {
    data = {
      phone: param.phone || '',
      name: param.name || '',
      productId: param.productId || '',
      productName: param.productName || '',
      need: param.need || '',
      needLabel: param.needLabel || '',
      qtyTier: param.qtyTier || '',
      qtyTierLabel: param.qtyTierLabel || '',
      qtyDetail: param.qtyDetail || '',
      note: param.note || '',
      pageUrl: param.pageUrl || '',
      submittedAt: param.submittedAt || '',
      source: param.source || '',
    };
  }

  const contents = (e.postData && e.postData.contents) || '';
  if (!data.phone && contents) {
    const trimmed = contents.trim();
    try {
      if (trimmed.charAt(0) === '{') {
        data = JSON.parse(trimmed);
      } else {
        const params = parseUrlEncoded_(trimmed);
        if (params.payload) {
          data = JSON.parse(params.payload);
        } else if (params.phone) {
          data = params;
        }
      }
    } catch (err2) {
      Logger.log('parse postData: ' + err2);
    }
  }

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
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('RFQ endpoint OK').setMimeType(ContentService.MimeType.TEXT);
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

/** Chạy thử trong Apps Script → ghi 1 dòng test vào Sheet. */
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
