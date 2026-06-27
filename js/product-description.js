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
    if (key.startsWith('cân nặng') || key.startsWith('can nang')) {
        return 'Cân nặng đóng hàng';
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

function isPricingItem(item) {
    const label = String(item.label || '').toLowerCase();
    const value = String(item.value || '').toLowerCase();
    const combined = `${label} ${value}`;
    return (
        /^giá\b/.test(label) ||
        /^sl\s/.test(label) ||
        /^trên\s/.test(label) ||
        /shopee/.test(combined) ||
        /zalo\s*0/.test(combined) ||
        /liên hệ/.test(combined) ||
        (/đ\/cái|đ\/ cái|đ\/sp/.test(value) && /giá|sl|mua/.test(combined))
    );
}

function parseSpecLine(line) {
    const text = line.replace(/^[•·]\s*/, '').trim();
    const colonMatch = text.match(/^([^:：]+)[:：]\s*(.+)$/s);

    if (colonMatch) {
        return {
            label: normalizeSpecLabel(colonMatch[1]),
            value: colonMatch[2].trim(),
        };
    }

    const prefixRules = [
        { pattern: /^cân nặng\b/i, label: 'Cân nặng đóng hàng' },
        { pattern: /^kt\b/i, label: 'Kích thước' },
        { pattern: /^kích thước\b/i, label: 'Kích thước' },
        { pattern: /^bao gồm\b/i, label: 'Bao gồm' },
        { pattern: /^ép kim\b/i, label: 'Ép kim' },
        { pattern: /^chất liệu\b/i, label: 'Chất liệu' },
        { pattern: /^vách chia\b/i, label: 'Vách chia' },
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

function splitItemsByType(items) {
    const specs = [];
    const pricing = [];
    items.forEach((item) => {
        if (isPricingItem(item)) {
            pricing.push(item);
        } else {
            specs.push(item);
        }
    });
    return { specs, pricing };
}

function parseProductDescription(description) {
    const raw = (description || '').trim();
    if (!raw) {
        return { intro: '', variants: [], specs: [], pricing: [] };
    }

    const blocks = raw.split(/\n\s*\n/);
    const introParts = [];
    const specBlocks = [];

    blocks.forEach((block) => {
        const trimmed = block.trim();
        if (!trimmed) return;

        const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
        const hasSpec = lines.some((l) => /^[•·]/.test(l) || /^【.+】$/.test(l));

        if (hasSpec) {
            specBlocks.push(trimmed);
        } else {
            introParts.push(trimmed.replace(/\n/g, ' '));
        }
    });

    const merged = { intro: introParts.join(' '), variants: [], specs: [], pricing: [] };
    specBlocks.forEach((block) => {
        const parsed = parseSpecBlock(block);
        merged.variants.push(...parsed.variants);
        const split = splitItemsByType(parsed.items);
        merged.specs.push(...split.specs);
        merged.pricing.push(...split.pricing);
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

function renderMetaRow(item) {
    const isSize = item.label === 'Kích thước';
    const ddClass = isSize ? 'pd-meta-dd pd-meta-size' : 'pd-meta-dd';
    return `
        <div class="pd-meta-row">
            <dt class="pd-meta-dt">${escapeHtml(item.label)}</dt>
            <dd class="${ddClass}">${escapeHtml(item.value)}</dd>
        </div>`;
}

function renderMetaList(items) {
    if (!items.length) return '';
    return `<dl class="pd-meta-dl">${items.map(renderMetaRow).join('')}</dl>`;
}

function renderPricingList(items) {
    if (!items.length) return '';
    const rows = items
        .map(
            (item) =>
                `<li class="pd-pricing-item"><span class="pd-pricing-label">${escapeHtml(item.label)}</span><span class="pd-pricing-value">${escapeHtml(item.value)}</span></li>`
        )
        .join('');
    return `
        <div class="pd-pricing">
            <h3 class="pd-pricing-title">Giá theo số lượng</h3>
            <ul class="pd-pricing-list">${rows}</ul>
        </div>`;
}

function renderSpecVariant(variant) {
    const split = splitItemsByType(variant.items);
    if (!split.specs.length && !split.pricing.length) return '';
    return `
        <div class="pd-spec-variant">
            <div class="pd-spec-variant-badge">${escapeHtml(variant.title)}</div>
            ${renderMetaList(split.specs)}
            ${renderPricingList(split.pricing)}
        </div>`;
}

function renderProductDescriptionHtml(description) {
    const parsed = parseProductDescription(description);
    const hasContent =
        parsed.intro ||
        parsed.specs.length ||
        parsed.pricing.length ||
        parsed.variants.length;

    if (!hasContent) {
        return `<p class="pd-desc-intro">${escapeHtml(description || '')}</p>`;
    }

    let html = '';
    if (parsed.intro) {
        html += `<p class="pd-desc-intro">${escapeHtml(parsed.intro)}</p>`;
    }

    if (parsed.specs.length) {
        html += `
            <div class="pd-specs-panel">
                <h3 class="pd-specs-panel-title">Thông số hộp</h3>
                ${renderMetaList(parsed.specs)}
            </div>`;
    }

    if (parsed.pricing.length) {
        html += renderPricingList(parsed.pricing);
    }

    parsed.variants.forEach((variant) => {
        html += renderSpecVariant(variant);
    });

    return html;
}
