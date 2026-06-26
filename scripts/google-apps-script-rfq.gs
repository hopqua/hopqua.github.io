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

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
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
  if (sh.getLastRow() === 0) {
    sh.appendRow([
      'thời gian', 'SĐT', 'tên', 'mẫu', 'id mẫu', 'nhu cầu', 'SL khoảng', 'SL cụ thể',
      'ghi chú', 'URL', 'trạng thái',
    ]);
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
  const text = [
    '📩 RFQ hopqua.github.io',
    `SĐT: ${data.phone}`,
    data.name ? `Tên: ${data.name}` : '',
    data.productName ? `Mẫu: ${data.productName}` : '',
    `Nhu cầu: ${data.needLabel || data.need}`,
    `SL: ${data.qtyTierLabel || data.qtyTier}${data.qtyDetail ? ' (' + data.qtyDetail + ')' : ''}`,
    data.note ? `Ghi chú: ${data.note}` : '',
  ].filter(Boolean).join('\n');
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
    muteHttpExceptions: true,
  });
}
