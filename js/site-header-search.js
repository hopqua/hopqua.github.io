document.addEventListener('DOMContentLoaded', function () {
    injectSiteSearchBar();
});

function injectSiteSearchBar() {
    if (document.getElementById('site-search-form')) {
        return;
    }

    const compactInner = document.querySelector('.header-compact-inner');
    const landingBar = document.querySelector('.site-header-bar');
    const legacyHeader = document.querySelector('header .container');
    const host = compactInner || landingBar || legacyHeader;
    if (!host) {
        return;
    }

    const initialQ = typeof getSearchQueryFromUrl === 'function' ? getSearchQueryFromUrl() : '';
    const action = '/tim-kiem.html';

    const wrap = document.createElement('div');
    wrap.className = 'site-search-wrap';
    if (landingBar) {
        wrap.classList.add('site-search-wrap--landing');
    }
    wrap.innerHTML = `
        <form id="site-search-form" class="site-search-form" action="${action}" method="get" role="search">
            <label class="sr-only" for="site-search-input">Tìm sản phẩm</label>
            <input
                id="site-search-input"
                class="site-search-input"
                type="search"
                name="q"
                value="${escapeHtmlAttr(initialQ)}"
                placeholder="Tìm mẫu hộp… (vd: hạc đỏ, 4 bánh, hộp cứng)"
                autocomplete="off"
                enterkeyhint="search"
            />
            <button type="submit" class="site-search-btn" aria-label="Tìm kiếm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
                    <path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span class="site-search-btn-text">Tìm</span>
            </button>
        </form>
        <div id="site-search-suggest" class="site-search-suggest" hidden></div>
    `;

    if (compactInner) {
        const nav = compactInner.querySelector('.header-compact-nav');
        if (nav) {
            compactInner.insertBefore(wrap, nav);
        } else {
            compactInner.appendChild(wrap);
        }
    } else if (landingBar) {
        const nav = landingBar.querySelector('.site-header-nav');
        if (nav) {
            landingBar.insertBefore(wrap, nav);
        } else {
            landingBar.appendChild(wrap);
        }
    } else {
        const nav = legacyHeader.querySelector('nav');
        if (nav) {
            nav.after(wrap);
        } else {
            legacyHeader.appendChild(wrap);
        }
    }

    const input = document.getElementById('site-search-input');
    const suggest = document.getElementById('site-search-suggest');
    if (!input || !suggest) {
        return;
    }

    let debounceTimer;
    input.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => updateSuggestions(input.value, suggest), 120);
    });

    input.addEventListener('focus', function () {
        if (input.value.trim()) {
            updateSuggestions(input.value, suggest);
        }
    });

    document.addEventListener('click', function (e) {
        if (!wrap.contains(e.target)) {
            suggest.hidden = true;
        }
    });

    input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            suggest.hidden = true;
            input.blur();
        }
    });
}

function updateSuggestions(query, suggestEl) {
    if (typeof searchProducts !== 'function') {
        suggestEl.hidden = true;
        return;
    }

    const render = () => {
        const q = query.trim();
        if (q.length < 2) {
            suggestEl.hidden = true;
            suggestEl.innerHTML = '';
            return;
        }
        const results = searchProducts(q).slice(0, 6);
        if (!results.length) {
            suggestEl.hidden = false;
            suggestEl.innerHTML = '<p class="site-search-suggest-empty">Không thấy mẫu phù hợp</p>';
            return;
        }
        suggestEl.innerHTML = results
            .map((p) => {
                const url =
                    typeof catalogProductUrl === 'function'
                        ? catalogProductUrl(p)
                        : `/p/${encodeURIComponent(p.id)}/`;
                const thumb = p.thumbnail
                    ? p.thumbnail.startsWith('http')
                        ? p.thumbnail
                        : `/${p.thumbnail.replace(/^\//, '')}`
                    : '';
                const priceLabel =
                    typeof formatCatalogRetailLabel === 'function'
                        ? formatCatalogRetailLabel(p)
                        : p.price;
                return `<a class="site-search-suggest-item" href="${url}">
                ${thumb ? `<img src="${thumb}" alt="" width="40" height="40" loading="lazy">` : ''}
                <span><strong>${escapeHtml(p.name)}</strong><em>${escapeHtml(priceLabel)}</em></span>
            </a>`;
            })
            .join('');
        suggestEl.hidden = false;
    };

    if (
        typeof loadCatalogProducts === 'function' &&
        typeof getCatalogProducts === 'function' &&
        !getCatalogProducts().length &&
        typeof getAllProducts !== 'function'
    ) {
        loadCatalogProducts().then(render).catch(() => {
            suggestEl.hidden = true;
        });
        return;
    }

    if (
        typeof loadCatalogProducts === 'function' &&
        typeof getCatalogProducts === 'function' &&
        !getCatalogProducts().length
    ) {
        loadCatalogProducts().then(render).catch(render);
        return;
    }

    render();
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escapeHtmlAttr(str) {
    return escapeHtml(str).replace(/'/g, '&#39;');
}
