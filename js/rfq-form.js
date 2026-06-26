/** RFQ — yêu cầu báo giá / gọi lại (không giỏ hàng). */
(function (global) {
    let rfqConfig = null;

    const NEED_LABELS = {
        bao_gia_si: 'Báo giá sỉ',
        thu_mau: 'Thử mẫu / mua lẻ ít',
        tu_van: 'Tư vấn chọn mẫu',
    };

    const QTY_LABELS = {
        '1-10': '1–10 cái',
        '11-99': '11–99 cái',
        '100-500': '100–500 cái',
        '500+': '500+ cái',
    };

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function normalizePhone(raw) {
        const digits = String(raw || '').replace(/\D/g, '');
        if (digits.length === 10 && digits.startsWith('0')) return digits;
        if (digits.length === 11 && digits.startsWith('84')) return '0' + digits.slice(2);
        return digits;
    }

    function isValidPhone(phone) {
        return /^0\d{9}$/.test(phone);
    }

    function loadConfig() {
        if (rfqConfig) return Promise.resolve(rfqConfig);
        return fetch('data/rfq-config.json')
            .then((r) => (r.ok ? r.json() : {}))
            .then((cfg) => {
                rfqConfig = cfg || {};
                return rfqConfig;
            })
            .catch(() => {
                rfqConfig = { shopPhone: '0965671689' };
                return rfqConfig;
            });
    }

    function renderRfqFormHtml(options) {
        const opts = options || {};
        const variant = opts.variant === 'compact' ? 'rfq-form--compact' : '';
        const productId = opts.productId || '';
        const productName = opts.productName || '';
        const formId = opts.formId || 'rfq-form';

        return `
        <section class="rfq-block ${variant}" aria-labelledby="${formId}-title">
            <div class="rfq-block-head">
                <h2 class="rfq-block-title" id="${formId}-title">${escapeHtml(opts.title || 'Gọi lại báo giá')}</h2>
                <p class="rfq-block-lead">${escapeHtml(opts.lead || 'Để SĐT — shop gọi tư vấn giá sỉ & chọn mẫu. Mua lẻ 1–10 cái vẫn dùng Shopee.')}</p>
            </div>
            <form class="rfq-form" id="${formId}" data-rfq-form novalidate>
                <input type="hidden" name="productId" value="${escapeHtml(productId)}">
                <input type="hidden" name="productName" value="${escapeHtml(productName)}">
                <input type="hidden" name="pageUrl" value="">
                <div class="rfq-field">
                    <label for="${formId}-phone">Số điện thoại <span class="rfq-req">*</span></label>
                    <input type="tel" id="${formId}-phone" name="phone" inputmode="tel" autocomplete="tel" placeholder="09xxxxxxxx" required>
                </div>
                <div class="rfq-field">
                    <label for="${formId}-name">Tên (tuỳ chọn)</label>
                    <input type="text" id="${formId}-name" name="name" autocomplete="name" placeholder="Anh/chị Tuấn">
                </div>
                ${productName ? `<div class="rfq-field rfq-field--static"><span class="rfq-label">Mẫu quan tâm</span><strong>${escapeHtml(productName)}</strong></div>` : ''}
                <div class="rfq-field">
                    <label for="${formId}-need">Nhu cầu</label>
                    <select id="${formId}-need" name="need">
                        <option value="bao_gia_si">Báo giá sỉ</option>
                        <option value="thu_mau">Thử mẫu / mua ít</option>
                        <option value="tu_van">Tư vấn chọn mẫu</option>
                    </select>
                </div>
                <div class="rfq-row">
                    <div class="rfq-field">
                        <label for="${formId}-qtyTier">SL ước tính</label>
                        <select id="${formId}-qtyTier" name="qtyTier">
                            <option value="1-10">1–10 cái</option>
                            <option value="11-99">11–99 cái</option>
                            <option value="100-500">100–500 cái</option>
                            <option value="500+">500+ cái</option>
                        </select>
                    </div>
                    <div class="rfq-field">
                        <label for="${formId}-qtyDetail">SL cụ thể (tuỳ chọn)</label>
                        <input type="number" id="${formId}-qtyDetail" name="qtyDetail" min="1" placeholder="vd. 200">
                    </div>
                </div>
                <div class="rfq-field">
                    <label for="${formId}-note">Ghi chú</label>
                    <textarea id="${formId}-note" name="note" rows="2" placeholder="Ngày cần hàng, in logo, ghi chú thêm…"></textarea>
                </div>
                <label class="rfq-consent">
                    <input type="checkbox" name="consent" value="yes" required>
                    <span data-rfq-consent-text>Đồng ý shop liên hệ qua điện thoại/Zalo.</span>
                </label>
                <div class="rfq-actions">
                    <button type="submit" class="rfq-submit">Gửi yêu cầu báo giá</button>
                </div>
                <p class="rfq-status" data-rfq-status hidden role="status"></p>
            </form>
        </section>`;
    }

    function buildZaloFallbackUrl(data, cfg) {
        const phone = (cfg && cfg.shopPhone) || '0965671689';
        const parts = [
            'Xin chào Vân Thắng, em muốn báo giá hộp Trung Thu.',
            data.productName ? `Mẫu: ${data.productName}` : '',
            `SĐT: ${data.phone}`,
            data.name ? `Tên: ${data.name}` : '',
            `Nhu cầu: ${NEED_LABELS[data.need] || data.need}`,
            `SL: ${QTY_LABELS[data.qtyTier] || data.qtyTier}${data.qtyDetail ? ` (${data.qtyDetail} cái)` : ''}`,
            data.note ? `Ghi chú: ${data.note}` : '',
        ].filter(Boolean);
        return `https://zalo.me/${phone}?text=${encodeURIComponent(parts.join('\n'))}`;
    }

    function collectFormData(form) {
        const fd = new FormData(form);
        return {
            phone: normalizePhone(fd.get('phone')),
            name: String(fd.get('name') || '').trim(),
            productId: String(fd.get('productId') || '').trim(),
            productName: String(fd.get('productName') || '').trim(),
            need: String(fd.get('need') || 'bao_gia_si'),
            qtyTier: String(fd.get('qtyTier') || '1-10'),
            qtyDetail: String(fd.get('qtyDetail') || '').trim(),
            note: String(fd.get('note') || '').trim(),
            pageUrl: form.querySelector('[name="pageUrl"]')?.value || location.href,
            submittedAt: new Date().toISOString(),
        };
    }

    function setStatus(form, message, type) {
        const el = form.querySelector('[data-rfq-status]');
        if (!el) return;
        el.hidden = !message;
        el.textContent = message || '';
        el.className = `rfq-status rfq-status--${type || 'info'}`;
    }

    /** POST qua iframe — cách ổn định nhất với Google Apps Script Web App. */
    function postRfqToGas(url, payload) {
        return new Promise((resolve, reject) => {
            const frameName = `rfq_gas_${Date.now()}`;
            const iframe = document.createElement('iframe');
            iframe.name = frameName;
            iframe.title = 'RFQ submit';
            iframe.setAttribute('aria-hidden', 'true');
            iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden';
            document.body.appendChild(iframe);

            const gasForm = document.createElement('form');
            gasForm.method = 'POST';
            gasForm.action = url;
            gasForm.target = frameName;
            gasForm.acceptCharset = 'UTF-8';
            gasForm.style.display = 'none';

            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'payload';
            input.value = JSON.stringify(payload);
            gasForm.appendChild(input);
            document.body.appendChild(gasForm);

            let settled = false;
            const finish = (ok) => {
                if (settled) return;
                settled = true;
                window.clearTimeout(timer);
                setTimeout(() => {
                    gasForm.remove();
                    iframe.remove();
                }, 500);
                if (ok) resolve();
                else reject(new Error('RFQ submit timeout'));
            };

            iframe.addEventListener('load', () => finish(true));
            const timer = window.setTimeout(() => finish(true), 4000);

            try {
                gasForm.submit();
            } catch (err) {
                finish(false);
                reject(err);
            }
        });
    }

    async function submitRfq(form) {
        const cfg = await loadConfig();
        const data = collectFormData(form);
        if (!isValidPhone(data.phone)) {
            setStatus(form, 'Vui lòng nhập SĐT 10 số (bắt đầu bằng 0).', 'error');
            return;
        }
        if (!form.querySelector('[name="consent"]')?.checked) {
            setStatus(form, 'Vui lòng đồng ý để shop liên hệ.', 'error');
            return;
        }

        const btn = form.querySelector('.rfq-submit');
        if (btn) btn.disabled = true;
        setStatus(form, 'Đang gửi…', 'info');

        const payload = {
            ...data,
            needLabel: NEED_LABELS[data.need] || data.need,
            qtyTierLabel: QTY_LABELS[data.qtyTier] || data.qtyTier,
            source: 'hopqua.github.io',
        };

        const url = (cfg.submitUrl || '').trim();
        if (url) {
            try {
                await postRfqToGas(url, payload);
                setStatus(
                    form,
                    `Cảm ơn anh/chị! Shop sẽ gọi ${data.phone} trong ${cfg.callbackNote || '15–30 phút'}.`,
                    'success'
                );
                form.reset();
                if (data.productId) {
                    form.querySelector('[name="productId"]').value = data.productId;
                    form.querySelector('[name="productName"]').value = data.productName;
                }
                if (btn) btn.disabled = false;
                return;
            } catch (err) {
                console.warn('RFQ iframe submit failed, retry no-cors', err);
                try {
                    const body = new URLSearchParams({ payload: JSON.stringify(payload) }).toString();
                    await fetch(url, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                        body,
                    });
                    setStatus(
                        form,
                        `Cảm ơn anh/chị! Shop sẽ gọi ${data.phone} trong ${cfg.callbackNote || '15–30 phút'}.`,
                        'success'
                    );
                    form.reset();
                    if (data.productId) {
                        form.querySelector('[name="productId"]').value = data.productId;
                        form.querySelector('[name="productName"]').value = data.productName;
                    }
                    if (btn) btn.disabled = false;
                    return;
                } catch (err2) {
                    console.warn('RFQ no-cors submit failed', err2);
                }
                setStatus(
                    form,
                    'Chưa gửi được tự động — mở Zalo để shop nhận ngay.',
                    'error'
                );
                window.open(buildZaloFallbackUrl(data, cfg), '_blank', 'noopener');
                if (btn) btn.disabled = false;
                return;
            }
        }

        setStatus(
            form,
            'Đã ghi nhận — mở Zalo để gửi nhanh cho shop (hoặc chờ shop gọi lại).',
            'success'
        );
        window.open(buildZaloFallbackUrl(data, cfg), '_blank', 'noopener');
        if (btn) btn.disabled = false;
    }

    function bindForm(form) {
        if (!form || form.dataset.rfqBound === '1') return;
        form.dataset.rfqBound = '1';
        const pageUrl = form.querySelector('[name="pageUrl"]');
        if (pageUrl) pageUrl.value = location.href;

        loadConfig().then((cfg) => {
            const consent = form.querySelector('[data-rfq-consent-text]');
            if (consent && cfg.consentText) consent.textContent = cfg.consentText;
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            submitRfq(form);
        });
    }

    function initRfqForms(root) {
        const scope = root || document;
        scope.querySelectorAll('[data-rfq-form]').forEach(bindForm);
    }

    function mountRfq(targetId, options) {
        const el = document.getElementById(targetId);
        if (!el) return;
        el.innerHTML = renderRfqFormHtml(options);
        initRfqForms(el);
    }

    global.renderRfqFormHtml = renderRfqFormHtml;
    global.initRfqForms = initRfqForms;
    global.mountRfq = mountRfq;
    global.loadRfqConfig = loadConfig;
})(typeof window !== 'undefined' ? window : globalThis);
