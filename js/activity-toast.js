/** Toast góc trái dưới — đơn RFQ thật (Sheet) + hoạt động tham khảo. Không hiện SĐT. */
(function (global) {
    const CONTAINER_ID = 'activity-toast-root';
    const QTY_FROM_TIER = { '1-10': 10, '11-99': 50, '100-500': 200, '500+': 500 };

    let currentSettings = null;
    let pendingItems = [];

    function fmtVnd(n) {
        if (!n) return '';
        return `${Number(n).toLocaleString('vi-VN')}đ`;
    }

    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function maskName(raw) {
        const s = String(raw || '').trim();
        if (!s) return 'Khách mới';
        return s.split(/\s+/)[0];
    }

    function qtyFromPayload(payload) {
        const detail = parseInt(String(payload.qtyDetail || '').trim(), 10);
        if (detail > 0) return detail;
        return QTY_FROM_TIER[payload.qtyTier] || null;
    }

    function formatQtyLine(item) {
        if (item.qtyTierLabel) {
            const detail = item.qtyDetail ? parseInt(String(item.qtyDetail), 10) : 0;
            if (detail > 0) {
                return `SL ${item.qtyTierLabel} (${detail} cái)`;
            }
            return `SL ${item.qtyTierLabel}`;
        }
        if (item.qty) {
            return `SL ~${item.qty} cái`;
        }
        return '';
    }

    function rfqPayloadToActivityItem(payload) {
        const product = String(payload.productName || '').trim();
        return {
            name: maskName(payload.name),
            product: product || '',
            needLabel: payload.needLabel || 'Báo giá sỉ',
            qtyTierLabel: payload.qtyTierLabel || '',
            qtyDetail: payload.qtyDetail || '',
            qtyTier: payload.qtyTier || '',
            note: String(payload.note || '').trim(),
            qty: qtyFromPayload(payload),
            type: 'rfq',
            real: true,
        };
    }

    function buildKicker(item) {
        if (!item.real) return 'Hoạt động gần đây';
        if (item.type === 'rfq' || !item.amountVnd) {
            return item.needLabel || 'Vừa gửi yêu cầu';
        }
        return 'Vừa đặt hàng';
    }

    function buildMessage(item) {
        const name = item.name || 'Khách';
        const region = item.region ? ` <span class="activity-toast-region">(${item.region})</span>` : '';
        const who = `<strong>${name}</strong>${region}`;

        if (item.type === 'rfq' || !item.amountVnd) {
            const need = item.needLabel || 'Báo giá sỉ';
            const qtyLine = formatQtyLine(item);
            const product = item.product;
            const parts = [
                `<span class="activity-toast-need">${need}</span>`,
                qtyLine ? `<span class="activity-toast-qty">${qtyLine}</span>` : '',
            ];
            if (product) parts.push(`<em>${product}</em>`);
            const note = String(item.note || '').trim();
            if (note && note.length <= 48) {
                parts.push(`<span class="activity-toast-note">${note}</span>`);
            }
            return `${who} — ${parts.filter(Boolean).join(' · ')}`;
        }

        const product = item.product || 'hộp Trung Thu';

        const qty = item.qty ? `<strong>${item.qty}</strong> hộp` : '';
        const amount = fmtVnd(item.amountVnd);
        return `${who} — vừa đặt ${qty} <em>${product}</em> · <strong>${amount}</strong>`;
    }

    function isDisabled(storageKey) {
        try {
            const until = localStorage.getItem(storageKey);
            if (!until) return false;
            return Date.now() < parseInt(until, 10);
        } catch (e) {
            return false;
        }
    }

    function disableForToday(storageKey) {
        try {
            const end = new Date();
            end.setHours(23, 59, 59, 999);
            localStorage.setItem(storageKey, String(end.getTime()));
        } catch (e) {
            /* ignore */
        }
    }

    function ensureRoot() {
        let root = document.getElementById(CONTAINER_ID);
        if (!root) {
            root = document.createElement('div');
            root.id = CONTAINER_ID;
            root.className = 'activity-toast-root';
            root.setAttribute('aria-live', 'polite');
            document.body.appendChild(root);
        }
        return root;
    }

    function showToast(root, item, settings, onDismiss) {
        const el = document.createElement('div');
        el.className = 'activity-toast' + (item.real ? ' activity-toast--real' : '');
        el.setAttribute('role', 'status');
        el.innerHTML = `
            <button type="button" class="activity-toast-close" aria-label="Đóng">×</button>
            <p class="activity-toast-kicker">${buildKicker(item)}</p>
            <p class="activity-toast-body">${buildMessage(item)}</p>
            <button type="button" class="activity-toast-mute">Không hiện hôm nay</button>
        `;
        root.appendChild(el);
        requestAnimationFrame(() => el.classList.add('activity-toast--visible'));

        const hide = () => {
            el.classList.remove('activity-toast--visible');
            setTimeout(() => el.remove(), 300);
            onDismiss();
        };

        const t = setTimeout(hide, settings.displayMs || 7500);
        el.querySelector('.activity-toast-close').addEventListener('click', () => {
            clearTimeout(t);
            hide();
        });
        el.querySelector('.activity-toast-mute').addEventListener('click', () => {
            disableForToday(settings.storageKey || 'hopqua_activity_toast_off');
            clearTimeout(t);
            hide();
        });
    }

    function randBetween(min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    function mergeFeeds(staticFeed, realFeed) {
        const settings = { ...(staticFeed && staticFeed.settings) };
        const demo = shuffle((staticFeed && staticFeed.items) || []);
        const real = ((realFeed && realFeed.items) || []).filter((item) => item && item.real !== false);
        return { settings, items: real.concat(demo) };
    }

    function loadRealActivityFeed() {
        return fetch('data/rfq-config.json')
            .then((r) => (r.ok ? r.json() : {}))
            .then((cfg) => {
                const base = String(cfg.submitUrl || '').trim();
                if (!base) return null;
                const sep = base.indexOf('?') >= 0 ? '&' : '?';
                return fetch(`${base}${sep}feed=activity&limit=20`, { mode: 'cors' });
            })
            .then((r) => (r && r.ok ? r.json() : null))
            .catch(() => null);
    }

    function start(feed) {
        const settings = feed.settings || {};
        currentSettings = settings;
        const storageKey = settings.storageKey || 'hopqua_activity_toast_off';

        const root = ensureRoot();

        if (pendingItems.length) {
            pendingItems.forEach((item) => showToast(root, item, settings, () => {}));
            pendingItems = [];
        }

        if (isDisabled(storageKey)) return;

        const queue = feed.items || [];
        let index = 0;
        let shown = 0;
        const max = settings.maxPerSession || 5;

        function next() {
            if (shown >= max || index >= queue.length) return;
            const item = queue[index++];
            shown += 1;
            showToast(root, item, settings, () => {
                const delay = randBetween(
                    settings.intervalMinMs || 65000,
                    settings.intervalMaxMs || 95000
                );
                setTimeout(next, delay);
            });
        }

        setTimeout(next, randBetween(12000, 22000));
    }

    function pushItem(item) {
        if (!item) return;
        const settings = currentSettings || {
            displayMs: 7500,
            storageKey: 'hopqua_activity_toast_off',
        };
        const root = ensureRoot();
        if (!currentSettings) {
            pendingItems.push(item);
            return;
        }
        showToast(root, item, settings, () => {});
    }

    function pushFromRfq(payload) {
        pushItem(rfqPayloadToActivityItem(payload));
    }

    global.HopQuaActivity = {
        pushItem,
        pushFromRfq,
        rfqPayloadToActivityItem,
    };

    document.addEventListener('DOMContentLoaded', () => {
        Promise.all([
            fetch('data/activity-feed.json').then((r) => (r.ok ? r.json() : null)),
            loadRealActivityFeed(),
        ])
            .then(([staticFeed, realFeed]) => {
                if (!staticFeed && !realFeed) return;
                const merged = mergeFeeds(staticFeed || { items: [] }, realFeed);
                if (merged.items.length) start(merged);
                else if (staticFeed) start(staticFeed);
            })
            .catch(() => {});
    });
})(typeof window !== 'undefined' ? window : globalThis);
