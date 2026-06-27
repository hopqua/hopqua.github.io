/** Footer + nút chat dùng chung — trang HTML tĩnh. */
(function () {
    const FOOTER_HTML = document.getElementById('site-footer-mount')
        ? `<footer class="site-footer"><div class="container site-footer-inner"><div class="site-footer-grid"><div class="site-footer-col"><h3 class="site-footer-title">Shop của chúng tôi</h3><a href="https://shopee.vn/longthibo958" target="_blank" rel="noopener sponsored" class="site-footer-link site-footer-link--shopee">Mua sắm tại Shopee</a><p class="site-footer-note">Mua lẻ online — nhiều ưu đãi</p></div><div class="site-footer-col"><h3 class="site-footer-title">Kết nối</h3><a href="https://www.facebook.com/Torangesvn/" target="_blank" rel="noopener noreferrer" class="site-footer-link">Fanpage Toranges</a><a href="https://zalo.me/g/vffwdx817" target="_blank" rel="noopener noreferrer" class="site-footer-link">Zalo nhóm 1</a><a href="https://zalo.me/g/qzfgvs076" target="_blank" rel="noopener noreferrer" class="site-footer-link">Zalo nhóm 2</a></div><div class="site-footer-col"><h3 class="site-footer-title">Liên hệ</h3><p class="site-footer-contact"><a href="https://zalo.me/0965671689" target="_blank" rel="noopener">Zalo: 0965671689</a></p><p class="site-footer-contact"><a href="mailto:van96hvnh@gmail.com">van96hvnh@gmail.com</a></p></div></div><div class="site-footer-bottom"><p>&copy; 2026 <strong>Hộp Bánh Trung Thu Vân Thắng</strong></p><p class="site-footer-nav"><a href="/18-mau-hot-2026.html">18 mẫu hot</a> · <a href="/cap-nhat-2026.html">Mẫu mới 2026</a> · <a href="/blog/">Blog</a> · <a href="/#bao-gia">Báo giá</a> · <a href="https://shopee.vn/longthibo958" target="_blank" rel="noopener sponsored">Shopee</a></p></div></div></footer>`
        : '';

    const CHAT_HTML = `<div class="site-chat-fabs" id="site-chat-fabs"><details class="site-chat-menu"><summary class="site-chat-fab site-chat-fab--more" aria-label="Thêm liên hệ"><span aria-hidden="true">⋯</span></summary><div class="site-chat-menu-panel"><a href="https://m.me/Torangesvn" target="_blank" rel="noopener noreferrer" class="site-chat-fab site-chat-fab--messenger" title="Messenger"><span class="sr-only">Messenger</span><svg viewBox="0 0 28 28" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M14 2.042C7.483 2.042 2.042 7.058 2.042 13.417c0 3.216 1.333 6.096 3.516 8.141V25.375l3.734-2.167c1.475.55 3.058.875 4.708.875 6.517 0 11.958-5.016 11.958-11.375S20.517 2.042 14 2.042zm1.3 14.266-2.7-2.891-5.117 2.891 5.584-5.85 2.7 2.933 5.116-2.891-5.583 5.808z"/></svg></a><a href="tel:0965671689" class="site-chat-fab site-chat-fab--call" title="Gọi điện"><span class="sr-only">Gọi</span><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></a></div></details><a href="https://zalo.me/0965671689" target="_blank" rel="noopener" class="site-chat-fab site-chat-fab--zalo" title="Chat Zalo"><span class="sr-only">Chat Zalo</span><img src="/image/zalo-hd-logo.png" alt="" width="28" height="28" loading="lazy"></a></div>`;

    function mount(id, html) {
        const el = document.getElementById(id);
        if (el && html) el.outerHTML = html;
    }

    document.addEventListener('DOMContentLoaded', () => {
        mount('site-footer-mount', FOOTER_HTML);
        const chatMount = document.getElementById('site-chat-mount');
        if (chatMount) chatMount.outerHTML = CHAT_HTML;
    });
})();
