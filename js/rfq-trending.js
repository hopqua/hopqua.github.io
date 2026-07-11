/** Widget «Mẫu được hỏi nhiều» — số liệu tham khảo (cập nhật trong data/rfq-trending.json). */
(function () {
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function renderTrending(data) {
        if (!data || !data.hotModels || !data.hotModels.length) return '';
        const chips = data.hotModels
            .map((m) => {
                const href = m.id ? `/p/${encodeURIComponent(m.id)}/` : '#';
                return `<a href="${href}" class="rfq-trend-chip">${escapeHtml(m.name)}</a>`;
            })
            .join('');
        const count = data.rfqCount ? `<span class="rfq-trend-stat">${data.rfqCount} yêu cầu báo giá</span>` : '';
        return `
        <aside class="rfq-trend" aria-label="Mẫu được hỏi nhiều">
            <div class="rfq-trend-head">
                <h2 class="rfq-trend-title">Mẫu được hỏi nhiều ${escapeHtml(data.weekLabel || 'tuần này')}</h2>
                ${count}
            </div>
            <div class="rfq-trend-chips">${chips}</div>
        </aside>`;
    }

    function mountTrending(targetId) {
        const el = document.getElementById(targetId);
        if (!el) return;
        fetch('data/rfq-trending.json')
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (data) el.innerHTML = renderTrending(data);
            })
            .catch(() => {});
    }

    document.addEventListener('DOMContentLoaded', () => {
        mountTrending('rfq-trending');
    });

    window.mountRfqTrending = mountTrending;
})();
