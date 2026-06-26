/** Toast góc trái dưới — hoạt động đặt mẫu (tên + vùng, không SĐT). */
(function () {
    const CONTAINER_ID = 'activity-toast-root';

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

    function buildMessage(item) {
        const name = item.name || 'Khách';
        const region = item.region ? ` <span class="activity-toast-region">(${item.region})</span>` : '';
        const who = `<strong>${name}</strong>${region}`;
        const product = item.product || 'hộp Trung Thu';
        const qty = item.qty ? `<strong>${item.qty}</strong> hộp` : '';

        if (item.type === 'rfq' || !item.amountVnd) {
            const note = item.note ? ` · <span class="activity-toast-note">${item.note}</span>` : '';
            return `${who} — vừa gửi yêu cầu báo giá ${qty} <em>${product}</em>${note}`;
        }
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

    function showToast(root, item, settings, onDismiss) {
        const el = document.createElement('div');
        el.className = 'activity-toast';
        el.setAttribute('role', 'status');
        el.innerHTML = `
            <button type="button" class="activity-toast-close" aria-label="Đóng">×</button>
            <p class="activity-toast-kicker">Hoạt động gần đây</p>
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

    function start(feed) {
        const settings = feed.settings || {};
        const storageKey = settings.storageKey || 'hopqua_activity_toast_off';
        if (isDisabled(storageKey)) return;

        let root = document.getElementById(CONTAINER_ID);
        if (!root) {
            root = document.createElement('div');
            root.id = CONTAINER_ID;
            root.className = 'activity-toast-root';
            root.setAttribute('aria-live', 'polite');
            document.body.appendChild(root);
        }

        const queue = shuffle(feed.items || []);
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

    document.addEventListener('DOMContentLoaded', () => {
        fetch('data/activity-feed.json')
            .then((r) => (r.ok ? r.json() : null))
            .then((feed) => {
                if (feed && feed.items && feed.items.length) start(feed);
            })
            .catch(() => {});
    });
})();
