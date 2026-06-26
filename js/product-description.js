function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function normalizeSpecLabel(label) {
    const key = label.trim().toLowerCase().replace(/\s+/g, ' ');
    if (key === 'kt' || key === 'kích thước' || key === 'kich thuoc') {
        return 'Kích thước';
    }
    if (key === 'bao gồm' || key === 'bao gom') {
        return 'Bao gồm';
    }
    if (key.startsWith('ép kim') || key.startsWith('ep kim')) {
        return 'Ép kim';
    }
    if (key.startsWith('chất liệu') || key.startsWith('chat lieu')) {
        return 'Chất liệu';
    }
    if (key.startsWith('vách chia') || key.startsWith('vach chia')) {
        return 'Vách chia';
    }
    return label.trim();
}

function parseSpecLine(line) {
    const text = line.replace(/^[•·]\s*/, '').trim();
    const colonMatch = text.match(/^([^:：]+)[:：]\s*(.+)$/s);

    if (colonMatch) {
        return {
            label: normalizeSpecLabel(colonMatch[1]),
            value: colonMatch[2].trim()
        };
    }

    const prefixRules = [
        { pattern: /^kt\b/i, label: 'Kích thước' },
        { pattern: /^kích thước\b/i, label: 'Kích thước' },
        { pattern: /^bao gồm\b/i, label: 'Bao gồm' },
        { pattern: /^ép kim\b/i, label: 'Ép kim' },
        { pattern: /^chất liệu\b/i, label: 'Chất liệu' },
        { pattern: /^vách chia\b/i, label: 'Vách chia' }
    ];

    for (const rule of prefixRules) {
        if (rule.pattern.test(text)) {
            const value = text.replace(rule.pattern, '').trim();
            return { label: rule.label, value: value || text };
        }
    }

    return { label: 'Chi tiết', value: text };
}

function parseSpecBlock(blockText) {
    const lines = blockText.split('\n').map((l) => l.trim()).filter(Boolean);
    const variants = [];
    let currentVariant = null;
    const items = [];

    function pushItem(item) {
        if (currentVariant) {
            currentVariant.items.push(item);
        } else {
            items.push(item);
        }
    }

    function lastItem() {
        if (currentVariant && currentVariant.items.length) {
            return currentVariant.items[currentVariant.items.length - 1];
        }
        if (items.length) {
            return items[items.length - 1];
        }
        return null;
    }

    lines.forEach((line) => {
        const variantMatch = line.match(/^【(.+)】$/);
        if (variantMatch) {
            currentVariant = { title: variantMatch[1].trim(), items: [] };
            variants.push(currentVariant);
            return;
        }

        if (/^[•·]/.test(line)) {
            pushItem(parseSpecLine(line));
            return;
        }

        const prev = lastItem();
        if (prev) {
            prev.value = `${prev.value} ${line}`.replace(/\s+/g, ' ').trim();
        }
    });

    return { variants, items };
}

function parseProductDescription(description) {
    const raw = (description || '').trim();
    if (!raw) {
        return { intro: '', variants: [], items: [] };
    }

    const blocks = raw.split(/\n\s*\n/);
    const introParts = [];
    const specBlocks = [];

    blocks.forEach((block) => {
        const trimmed = block.trim();
        if (!trimmed) return;

        const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
        const hasSpec = lines.some(
            (l) => /^[•·]/.test(l) || /^【.+】$/.test(l)
        );

        if (hasSpec) {
            specBlocks.push(trimmed);
        } else {
            introParts.push(trimmed.replace(/\n/g, ' '));
        }
    });

    const merged = { intro: introParts.join(' '), variants: [], items: [] };
    specBlocks.forEach((block) => {
        const parsed = parseSpecBlock(block);
        merged.variants.push(...parsed.variants);
        merged.items.push(...parsed.items);
    });

    return merged;
}

function getProductIntro(description) {
    const parsed = parseProductDescription(description);
    if (parsed.intro) {
        return parsed.intro;
    }

    const firstLine = (description || '').split('\n')[0].trim();
    return firstLine || '';
}

function renderSpecRow(item) {
    const isSize = item.label === 'Kích thước';
    const valueClass = isSize ? 'pd-spec-value pd-spec-size' : 'pd-spec-value';

    return `
        <div class="pd-spec-row">
            <dt class="pd-spec-label">${escapeHtml(item.label)}</dt>
            <dd class="${valueClass}">${escapeHtml(item.value)}</dd>
        </div>
    `;
}

function renderSpecList(items) {
    if (!items.length) return '';
    return `<dl class="pd-spec-list">${items.map(renderSpecRow).join('')}</dl>`;
}

function renderSpecVariant(variant) {
    if (!variant.items.length) return '';
    return `
        <div class="pd-spec-variant">
            <div class="pd-spec-variant-badge">${escapeHtml(variant.title)}</div>
            ${renderSpecList(variant.items)}
        </div>
    `;
}

function renderProductDescriptionHtml(description) {
    const parsed = parseProductDescription(description);
    const hasSpecs = parsed.items.length > 0 || parsed.variants.length > 0;

    if (!hasSpecs) {
        return `<p class="pd-desc-intro">${escapeHtml(description || '')}</p>`;
    }

    let html = '';
    if (parsed.intro) {
        html += `<p class="pd-desc-intro">${escapeHtml(parsed.intro)}</p>`;
    }

    html += `
        <div class="pd-specs">
            <div class="pd-specs-head">
                <span class="pd-specs-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                        <line x1="12" y1="22.08" x2="12" y2="12"/>
                    </svg>
                </span>
                <span class="pd-specs-title">Thông số kỹ thuật</span>
            </div>
    `;

    parsed.variants.forEach((variant) => {
        html += renderSpecVariant(variant);
    });

    if (parsed.items.length) {
        html += renderSpecList(parsed.items);
    }

    html += '</div>';
    return html;
}
