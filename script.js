// ============================================================
// CAROUSEL
// ============================================================
const slides = document.querySelectorAll('.carousel-slide');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const dotsContainer = document.getElementById('carouselDots');
let currentSlide = 0;
const slideIntervalTime = 5000;
let slideInterval;

slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => { goToSlide(index); resetTimer(); });
    dotsContainer.appendChild(dot);
});
const dots = document.querySelectorAll('.dot');

function updateSliders() {
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
        dots[index].classList.toggle('active', index === currentSlide);
    });
}
function nextSlide() { currentSlide = (currentSlide + 1) % slides.length; updateSliders(); }
function prevSlide() { currentSlide = (currentSlide - 1 + slides.length) % slides.length; updateSliders(); }
function goToSlide(index) { currentSlide = index; updateSliders(); }
function startTimer() { slideInterval = setInterval(nextSlide, slideIntervalTime); }
function resetTimer() { clearInterval(slideInterval); startTimer(); }

nextBtn.addEventListener('click', () => { nextSlide(); resetTimer(); });
prevBtn.addEventListener('click', () => { prevSlide(); resetTimer(); });

let touchStartX = 0;
const carouselEl = document.querySelector('.carousel-slider');
carouselEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
carouselEl.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? nextSlide() : prevSlide(); resetTimer(); }
});
startTimer();


// ============================================================
// UNIFIED STATE
// ============================================================
const state = {
    garantie:    null,   // { dagen, label, prijs } — modchip garantie (geldt voor alle consoles)
    repGarantie: null,   // { dagen, label, prijs } — reparatie garantie
};
const selectedConsoles = [];       // [{ model, label, prijs }] — meerdere modchip consoles
const selectedRepairs = new Map(); // key = 'model||naam' → { model, naam, prijs }

// Helper: console icoon per model
function consoleIcon(model) {
    return model === 'Lite' ? 'boxicons:handheld-alt-filled' : 'game-icons:game-console';
}
// Helper: totale modchip prijs
function consolesTotal() {
    return selectedConsoles.reduce((s, c) => s + c.prijs, 0);
}


// ============================================================
// REPARATIE RIJ SELECTIE — multi-select, geen tabs
// ============================================================
document.querySelectorAll('.rep-row').forEach(row => {
    row.addEventListener('click', () => {
        const naam  = row.dataset.repNaam;
        const model = row.dataset.repModel;
        const prijs = parseInt(row.dataset.repPrijs);

        const key = model + '||' + naam;
        if (selectedRepairs.has(key)) {
            selectedRepairs.delete(key);
            row.classList.remove('geselecteerd');
            row.querySelector('.rep-row-btn').textContent = 'Selecteer';
        } else {
            selectedRepairs.set(key, { model, naam, prijs });
            row.classList.add('geselecteerd');
            row.querySelector('.rep-row-btn').innerHTML = '<i class="fa-solid fa-check"></i> Geselecteerd';
            // Standaard 90 dagen reparatiegarantie als nog niet gekozen
            if (!state.repGarantie) {
                state.repGarantie = { dagen: '90', label: '90 Dagen Garantie', prijs: 0 };
            }
        }
        refreshAll();
    });
});


// ============================================================
// SERVICE CARD BUTTONS → select console, scroll to garantie
// ============================================================
document.querySelectorAll('.aanvragen-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();

        // Voeg console toe (meerdere toegestaan, ook duplicaten)
        selectedConsoles.push({
            model: btn.dataset.model,
            label: btn.dataset.label,
            method: btn.dataset.method || '',
            prijs: parseInt(btn.dataset.prijs)
        });
        // Default garantie als nog niet gekozen
        if (!state.garantie) {
            state.garantie = { dagen: '90', label: '90 Dagen Garantie', prijs: 0 };
        }

        // Korte visuele bevestiging op de knop
        btn.classList.add('geselecteerd');
        const orig = btn.dataset.label;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Toegevoegd';
        setTimeout(() => {
            btn.classList.remove('geselecteerd');
            btn.innerHTML = 'Selecteer <i class="fa-solid fa-arrow-right"></i>';
        }, 1200);

        refreshAll();
        document.getElementById('garantie').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});


// ============================================================
// GARANTIE CARD BUTTONS
// ============================================================
document.querySelectorAll('.garantie-select-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();

        document.querySelectorAll('.garantie-select-btn').forEach(b => {
            b.classList.remove('geselecteerd');
            b.innerHTML = 'Selecteer <i class="fa-solid fa-arrow-right"></i>';
        });
        btn.classList.add('geselecteerd');
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Geselecteerd';

        state.garantie = {
            dagen: btn.dataset.garantie,
            label: btn.dataset.garantieLabel,
            prijs: parseInt(btn.dataset.garantiePrijs)
        };

        refreshAll();
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});


// ============================================================
// FORM — manual dropdown / radio sync
// ============================================================
const consoleSelect = document.getElementById('console');
document.getElementById('consoleAddBtn').addEventListener('click', () => {
    const opt = consoleSelect.options[consoleSelect.selectedIndex];
    if (!consoleSelect.value) return;
    selectedConsoles.push({
        model: consoleSelect.value,
        label: opt.dataset.label || opt.text.split(' — ')[0],
        method: opt.dataset.method || '',
        prijs: parseInt(opt.dataset.prijs)
    });
    if (!state.garantie) {
        state.garantie = { dagen: '90', label: '90 Dagen Garantie', prijs: 0 };
    }
    consoleSelect.value = '';
    refreshAll();
});

// Verwijder een console uit de lijst
function removeConsole(index) {
    selectedConsoles.splice(index, 1);
    if (selectedConsoles.length === 0) state.garantie = null;
    refreshAll();
}

document.querySelectorAll('input[name="garantie"]').forEach(radio => {
    radio.addEventListener('change', () => {
        state.garantie = {
            dagen: radio.value,
            label: radio.value === '90' ? '90 Dagen Garantie' : '180 Dagen Garantie',
            prijs: parseInt(radio.dataset.extra)
        };
        refreshAll();
    });
});

document.querySelectorAll('input[name="rep_garantie"]').forEach(radio => {
    radio.addEventListener('change', () => {
        state.repGarantie = {
            dagen: radio.value,
            label: radio.value === '90' ? '90 Dagen Garantie' : '180 Dagen Garantie',
            prijs: parseInt(radio.dataset.extra)
        };
        refreshAll();
    });
});


// ============================================================
// REFRESH ALL
// ============================================================
function refreshAll() {
    updateStickyBar();
    updateOrderSummary();
    updateFormBlocks();
    updateRepairBar();
}


// ============================================================
// FORM BLOCKS — show/hide garantie, show status labels
// ============================================================
function updateFormBlocks() {
    const hasConsole  = selectedConsoles.length > 0;
    const hasGarantie = !!state.garantie;
    const hasRepairs  = selectedRepairs.size > 0;

    // Show garantie radio only after at least one console chosen
    document.getElementById('garantieFormGroup').style.display = hasConsole ? '' : 'none';
    document.getElementById('moddingEmpty').style.display      = hasConsole ? 'none' : '';

    // Render console list in form
    const listEl = document.getElementById('consoleList');
    listEl.style.display = hasConsole ? '' : 'none';
    listEl.innerHTML = selectedConsoles.map((c, i) =>
        `<div class="intake-console-item">
            <iconify-icon icon="${consoleIcon(c.model)}" class="intake-console-glyph"></iconify-icon>
            <span class="intake-console-namecol">${c.label}${c.method ? `<span class="intake-method-badge intake-method-${c.method.toLowerCase()}">${c.method}</span>` : ''}</span>
            <span class="intake-console-prijs">€ ${c.prijs},-</span>
            <button type="button" class="intake-console-remove" data-idx="${i}" aria-label="Verwijderen"><i class="fa-solid fa-xmark"></i></button>
        </div>`
    ).join('');
    listEl.querySelectorAll('.intake-console-remove').forEach(btn => {
        btn.addEventListener('click', () => removeConsole(parseInt(btn.dataset.idx)));
    });

    // Sync garantie radio
    if (state.garantie) {
        const radio = document.querySelector(`input[name="garantie"][value="${state.garantie.dagen}"]`);
        if (radio) radio.checked = true;
    }

    // Status badges
    const moddingStatus   = document.getElementById('moddingStatus');
    const reparatieStatus = document.getElementById('reparatieStatus');

    if (hasConsole && hasGarantie) {
        const n = selectedConsoles.length;
        moddingStatus.textContent = '✓ ' + n + (n === 1 ? ' console' : ' consoles') + ' · ' + state.garantie.dagen + 'd garantie';
        moddingStatus.className   = 'aanvraag-block-status aanvraag-block-status-done';
    } else if (hasConsole) {
        moddingStatus.textContent = selectedConsoles.length + ' console(s) — kies garantie';
        moddingStatus.className   = 'aanvraag-block-status aanvraag-block-status-partial';
    } else {
        moddingStatus.textContent = '';
        moddingStatus.className   = 'aanvraag-block-status';
    }

    if (hasRepairs) {
        const count = selectedRepairs.size;
        const total = [...selectedRepairs.values()].reduce((s, r) => s + r.prijs, 0);
        reparatieStatus.textContent = '✓ ' + count + (count === 1 ? ' reparatie' : ' reparaties') + ' — ≈ € ' + total + ',-';
        reparatieStatus.className   = 'aanvraag-block-status aanvraag-block-status-done';
    } else {
        reparatieStatus.textContent = '';
        reparatieStatus.className   = 'aanvraag-block-status';
    }

    // Repair form section — grouped by model
    const repEmpty  = document.getElementById('repAanvraagEmpty');
    const repFilled = document.getElementById('repAanvraagFilled');
    if (hasRepairs) {
        const repairs = [...selectedRepairs.values()];
        const total   = repairs.reduce((s, r) => s + r.prijs, 0);
        repEmpty.style.display  = 'none';
        repFilled.style.display = '';

        // Group by model
        const byModel = new Map();
        repairs.forEach(r => {
            if (!byModel.has(r.model)) byModel.set(r.model, []);
            byModel.get(r.model).push(r);
        });

        document.getElementById('repFormPrijs').textContent = '≈ € ' + total + ',-';

        // Device icon per model
        const modelIcon = (model) => {
            if (model.includes('Lite')) return 'fa-solid fa-mobile-screen';
            return 'fa-solid fa-gamepad';
        };

        // Render rows grouped by model — always show model header
        document.getElementById('repFormItems').innerHTML = [...byModel.entries()].map(([model, reps]) =>
            `<div class="intake-rep-model">${model}</div>` +
            reps.map(r => `<div class="intake-rep-item"><span class="intake-rep-item-name"><i class="fa-solid fa-screwdriver-wrench"></i> ${r.naam.split('(')[0].trim()}</span><span class="intake-rep-item-price">€ ${r.prijs},-</span></div>`).join('')
        ).join('');
    } else {
        repEmpty.style.display  = '';
        repFilled.style.display = 'none';
    }
}


// ============================================================
// REPAIR SELECTED BAR (under the repair grid)
// ============================================================
function updateRepairBar() {
    const bar = document.getElementById('repSelectedBar');
    if (!bar) return;
    const count = selectedRepairs.size;
    if (count === 0) { bar.style.display = 'none'; return; }
    bar.style.display = '';
    const total = [...selectedRepairs.values()].reduce((s, r) => s + r.prijs, 0);
    document.getElementById('repSelectedCount').textContent = count + (count === 1 ? ' reparatie geselecteerd' : ' reparaties geselecteerd');
    document.getElementById('repSelectedTotal').textContent = '≈ € ' + total + ',-';
    document.getElementById('repSelectedChips').innerHTML = [...selectedRepairs.values()].map(r =>
        `<span class="rep-chip">${r.naam.split('(')[0].trim()}</span>`
    ).join('');
}


// ============================================================
// STICKY BAR
// ============================================================
const stickyBar          = document.getElementById('stickySelection');
const stickyTotal        = document.getElementById('stickyTotal');
const stickyGroupModchip = document.getElementById('stickyGroupModchip');
const stickyGroupRepair  = document.getElementById('stickyGroupRepair');
const stickyModchipChips = document.getElementById('stickyModchipChips');
const stickyRepairChips  = document.getElementById('stickyRepairChips');

// Kleur per model
function modelColor(model) {
    if (model.includes('Lite')) return { bg: '#e2e8f0', color: '#0f1115' };
    if (model.includes('OLED')) return { bg: '#fb923c', color: '#000' };
    return { bg: '#00ff88', color: '#000' };
}
// Maak een badge
function makeChip(label, style, onRemove) {
    // Wrapper houdt de tekstbubbel en het kruis-bubbeltje samen
    const wrap = document.createElement('div');
    wrap.className = 'sticky-chip-wrap';

    const text = document.createElement('div');
    text.className = 'sticky-chip';
    text.style.cssText = style;
    text.innerHTML = `<span>${label}</span>`;
    wrap.appendChild(text);

    if (onRemove) {
        text.classList.add('has-x');
        const x = document.createElement('button');
        x.type = 'button';
        x.className = 'sticky-chip-x';
        x.setAttribute('aria-label', 'Verwijderen');
        x.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 5 L19 19 M19 5 L5 19" stroke="#dc2626" stroke-width="4.5" stroke-linecap="round"/></svg>';
        x.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); onRemove(); });
        wrap.appendChild(x);
    }
    return wrap;
}

// Verwijder-helpers
function clearAllConsoles() {
    selectedConsoles.length = 0;
    state.garantie = null;
    document.querySelectorAll('.aanvragen-btn').forEach(b => {
        b.classList.remove('geselecteerd');
        b.innerHTML = 'Selecteer <i class="fa-solid fa-arrow-right"></i>';
    });
    refreshAll();
}
function clearAllRepairs() {
    selectedRepairs.clear();
    state.repGarantie = null;
    document.querySelectorAll('.rep-row.geselecteerd, .rep-inline-row.geselecteerd').forEach(r => {
        r.classList.remove('geselecteerd');
        const btn = r.querySelector('.rep-row-btn, .rep-inline-btn');
        if (btn) btn.textContent = 'Selecteer';
    });
    refreshAll();
}

function updateStickyBar() {
    const hasConsole  = selectedConsoles.length > 0;
    const hasGarantie = !!state.garantie;
    const hasRepairs  = selectedRepairs.size > 0;

    // Clean up dynamic elements
    document.querySelectorAll('.sticky-aanvraag-btn').forEach(c => c.remove());
    stickyModchipChips.innerHTML = '';
    stickyRepairChips.innerHTML = '';

    if (!hasConsole && !hasRepairs) {
        stickyBar.classList.remove('visible');
        return;
    }
    stickyBar.classList.add('visible');

    // ── MODCHIP GROUP ──
    if (hasConsole) {
        stickyGroupModchip.style.display = '';

        // Console badges — bij 1 console de naam, bij meerdere een samenvatting
        if (selectedConsoles.length === 1) {
            const c = selectedConsoles[0];
            const col = modelColor(c.model);
            stickyModchipChips.appendChild(makeChip(c.label, `background:${col.bg};color:${col.color};border-color:${col.bg};`, () => removeConsole(0)));
        } else {
            const n = selectedConsoles.length;
            // Zelfde model? → modelkleur. Mix? → blauw/cyaan
            const uniqueModels = new Set(selectedConsoles.map(c =>
                c.model.includes('Lite') ? 'lite' : c.model.includes('OLED') ? 'oled' : 'v1v2'));
            const col = uniqueModels.size === 1
                ? modelColor(selectedConsoles[0].model)
                : { bg: '#22d3ee', color: '#000' };
            stickyModchipChips.appendChild(makeChip(n + ' consoles', `background:${col.bg};color:${col.color};border-color:${col.bg};`, clearAllConsoles));
        }

        // Garantie badge — schild + korte tekst
        if (hasGarantie) {
            const is180 = state.garantie.dagen === '180';
            const style = is180
                ? 'background:#f59e0b;color:#000;border-color:#f59e0b;'
                : 'background:transparent;color:var(--text-muted);border-color:var(--border);';
            const icon = is180 ? 'fa-shield' : 'fa-shield-halved';
            const label = `<i class="fa-solid ${icon}" style="margin-right:6px;"></i>${state.garantie.dagen} dagen`;
            stickyModchipChips.appendChild(makeChip(label, style));
        }
    } else {
        stickyGroupModchip.style.display = 'none';
    }

    // ── REPARATIE GROUP ──
    if (hasRepairs) {
        stickyGroupRepair.style.display = '';

        // Reparatie badge — bij 1 de naam in modelkleur, bij meerdere een samenvatting
        const repCount = selectedRepairs.size;
        if (repCount === 1) {
            const r = [...selectedRepairs.values()][0];
            const col = modelColor(r.model);
            const naam = r.naam.split('(')[0].trim();
            stickyRepairChips.appendChild(makeChip(naam, `background:${col.bg};color:${col.color};border-color:${col.bg};`, clearAllRepairs));
        } else {
            // Zelfde model? → modelkleur. Mix? → blauw/cyaan
            const uniqueModels = new Set([...selectedRepairs.values()].map(r =>
                r.model.includes('Lite') ? 'lite' : r.model.includes('OLED') ? 'oled' : 'v1v2'));
            const col = uniqueModels.size === 1
                ? modelColor([...selectedRepairs.values()][0].model)
                : { bg: '#22d3ee', color: '#000' };
            stickyRepairChips.appendChild(makeChip(repCount + ' reparaties', `background:${col.bg};color:${col.color};border-color:${col.bg};`, clearAllRepairs));
        }

        // Reparatie-garantie badge — schild + korte tekst
        if (state.repGarantie) {
            const is180 = state.repGarantie.dagen === '180';
            const style = is180
                ? 'background:#f59e0b;color:#000;border-color:#f59e0b;'
                : 'background:transparent;color:var(--text-muted);border-color:var(--border);';
            const icon = is180 ? 'fa-shield' : 'fa-shield-halved';
            const label = `<i class="fa-solid ${icon}" style="margin-right:6px;"></i>${state.repGarantie.dagen} dagen`;
            stickyRepairChips.appendChild(makeChip(label, style));
        }
    } else {
        stickyGroupRepair.style.display = 'none';
    }

    // ── TOTAL + AANVRAAG KNOP ──
    let total = 0;
    if (hasConsole) total += consolesTotal();
    if (hasGarantie) total += state.garantie.prijs;
    if (state.repGarantie) total += state.repGarantie.prijs;
    selectedRepairs.forEach(r => total += r.prijs);
    const prefix = hasRepairs && (!hasConsole || !hasGarantie) ? '≈ ' : '';
    const totalStr = prefix + '€ ' + total + ',-';

    const stickyRight = document.querySelector('.sticky-right');
    const aanvraagBtn = document.createElement('a');
    aanvraagBtn.href = '#contact';
    aanvraagBtn.className = 'sticky-aanvraag-btn';
    aanvraagBtn.innerHTML = `<span class="sticky-btn-price">${totalStr}</span><span class="sticky-btn-divider"></span>Aanvraag <i class="fa-solid fa-arrow-right"></i>`;
    stickyRight.appendChild(aanvraagBtn);
    stickyTotal.style.display = 'none';
}


// ============================================================
// ORDER SUMMARY PANEL
// ============================================================
function updateOrderSummary() {
    const hasConsole     = selectedConsoles.length > 0;
    const hasGarantie    = !!state.garantie;
    const hasRepairs     = selectedRepairs.size > 0;
    const hasRepGarantie = !!state.repGarantie;
    const hasAnything    = hasConsole || hasRepairs;

    document.getElementById('summaryPlaceholder').style.display        = hasAnything ? 'none' : '';
    document.getElementById('summaryModchipSection').style.display     = hasConsole ? '' : 'none';
    document.getElementById('summaryReparatieSection').style.display   = hasRepairs ? '' : 'none';
    document.getElementById('summaryGarantieRow').style.display        = hasGarantie ? '' : 'none';
    document.getElementById('summaryGarantiePending').style.display    = (hasConsole && !hasGarantie) ? '' : 'none';
    document.getElementById('summaryTotalWrap').style.display          = hasAnything ? '' : 'none';
    document.getElementById('summaryIncludes').style.display           = hasAnything ? '' : 'none';

    // Render console rows
    const consoleRows = document.getElementById('summaryConsoleRows');
    if (hasConsole) {
        consoleRows.innerHTML = selectedConsoles.map(c => {
            const badge = c.method ? `<span class="summary-method-badge summary-method-${c.method.toLowerCase()}">${c.method}</span>` : '';
            return `<div class="order-row">
                <div class="order-row-label"><iconify-icon icon="${consoleIcon(c.model)}" class="summary-console-glyph"></iconify-icon><span class="summary-console-namecol">${c.label}${badge}</span></div>
                <span class="order-row-prijs">€ ${c.prijs},-</span>
            </div>`;
        }).join('');
    } else {
        consoleRows.innerHTML = '';
    }

    if (hasGarantie) {
        document.getElementById('summaryGarantieName').textContent  = state.garantie.label;
        document.getElementById('summaryGarantiePrice').textContent = state.garantie.prijs === 0 ? 'Inbegrepen' : '+ € ' + state.garantie.prijs + ',-';
        document.getElementById('summaryGarantiePrice').style.color = state.garantie.prijs > 0 ? '#f59e0b' : '';
        const gIcon = document.getElementById('summaryGarantieIcon');
        if (state.garantie.dagen === '180') {
            gIcon.className = 'fa-solid fa-shield summary-garantie-icon-180';
        } else {
            gIcon.className = 'fa-solid fa-shield-halved summary-garantie-icon-90';
        }
    }

    // Dynamic repair rows — grouped by model
    const repContainer = document.getElementById('summaryRepairRows');
    repContainer.innerHTML = '';

    if (hasRepairs) {
        const byModel = new Map();
        selectedRepairs.forEach(r => {
            if (!byModel.has(r.model)) byModel.set(r.model, []);
            byModel.get(r.model).push(r);
        });

        byModel.forEach((repairs, model) => {
            // Altijd model header tonen — ook bij 1 model
            const header = document.createElement('div');
            header.className = 'order-row-model-header';
            header.textContent = model;
            repContainer.appendChild(header);
            repairs.forEach(r => {
                const row = document.createElement('div');
                row.className = 'order-row order-row-repair';
                row.innerHTML = `<div class="order-row-label"><i class="fa-solid fa-screwdriver-wrench"></i><span>${r.naam.split('(')[0].trim()}</span></div><span class="order-row-prijs">€ ${r.prijs},-</span>`;
                repContainer.appendChild(row);
            });
        });
    }

    // Reparatie garantie rij
    const repGarantieRow = document.getElementById('summaryRepGarantieRow');
    if (hasRepairs && hasRepGarantie) {
        repGarantieRow.style.display = '';
        document.getElementById('summaryRepGarantieName').textContent  = state.repGarantie.label;
        document.getElementById('summaryRepGarantiePrice').textContent = state.repGarantie.prijs === 0 ? 'Inbegrepen' : '+ € ' + state.repGarantie.prijs + ',-';
        document.getElementById('summaryRepGarantiePrice').style.color = state.repGarantie.prijs > 0 ? '#f59e0b' : '';
        const rgIcon = document.getElementById('summaryRepGarantieIcon');
        rgIcon.className = state.repGarantie.dagen === '180' ? 'fa-solid fa-shield summary-garantie-icon-180' : 'fa-solid fa-shield-halved summary-garantie-icon-90';
    } else {
        repGarantieRow.style.display = 'none';
    }

    // Total
    let total = 0;
    if (hasConsole)     total += consolesTotal();
    if (hasGarantie)    total += state.garantie.prijs;
    if (hasRepGarantie) total += state.repGarantie.prijs;
    selectedRepairs.forEach(r => total += r.prijs);
    const prefix = hasRepairs && (!hasConsole || !hasGarantie) ? '≈ ' : '';
    document.getElementById('summaryTotal').textContent = prefix + '€ ' + total + ',-';

    // Includes list
    const includesList = document.getElementById('summaryIncludesList');
    let items = [];
    if (hasConsole) items = items.concat([
        '<li><i class="fa-solid fa-check"></i> Picofly RP2040 Zero chip</li>',
        '<li><i class="fa-solid fa-check"></i> Micro-soldeerwerk onder microscoop</li>',
        '<li><i class="fa-solid fa-check"></i> Dual-boot setup (SysNAND + EmuNAND)</li>',
        '<li><i class="fa-solid fa-check"></i> Gratis software-configuratie</li>',
        '<li><i class="fa-solid fa-check"></i> Vervanging thermal paste</li>',
    ]);
    if (hasRepairs) items = items.concat([
        '<li><i class="fa-solid fa-check"></i> Inspectie & diagnose</li>',
        '<li><i class="fa-solid fa-check"></i> Originele kwaliteitsonderdelen</li>',
        '<li><i class="fa-solid fa-check"></i> 30 dagen reparatiegarantie</li>',
    ]);
    includesList.innerHTML = [...new Set(items)].join('');
}


// ============================================================
// CLEAR REPAIR SELECTION
// ============================================================
document.getElementById('repAanvraagClear').addEventListener('click', () => {
    selectedRepairs.clear();
    document.querySelectorAll('.rep-row').forEach(r => {
        r.classList.remove('geselecteerd');
        r.querySelector('.rep-row-btn').textContent = 'Selecteer';
    });
    refreshAll();
});


// ============================================================
// KANAAL & SUBMIT
// ============================================================
const kanaalIcons   = { telegram: 'fa-brands fa-telegram', whatsapp: 'fa-brands fa-whatsapp', reddit: 'fa-brands fa-reddit', discord: 'fa-brands fa-discord' };
const kanaalNamen   = { telegram: 'Verder via Telegram', whatsapp: 'Verder via WhatsApp', reddit: 'Verder via Reddit', discord: 'Verder via Discord' };
const kanaalKlassen = { telegram: 'tg', whatsapp: 'wa', reddit: 'rd', discord: 'dc' };

const submitBtn  = document.getElementById('submitBtn');
const submitHint = document.getElementById('submitHint');

document.querySelectorAll('.kanaal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.kanaal-btn').forEach(b => b.classList.remove('geselecteerd'));
        btn.classList.add('geselecteerd');
        document.getElementById('gekozenKanaal').value = btn.dataset.kanaal;
        document.getElementById('gekozenUrl').value    = btn.dataset.url;
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn-submit-disabled');
        submitHint.classList.add('hidden');
        submitBtn.classList.remove('kleur-tg', 'kleur-wa', 'kleur-rd', 'kleur-dc');
        submitBtn.classList.add('kleur-' + kanaalKlassen[btn.dataset.kanaal]);
        const submitIcon = document.getElementById('submitIcon');
        if (submitIcon) submitIcon.remove();
    });
});

document.getElementById('modForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const kanaal    = document.getElementById('gekozenKanaal').value;
    const url       = document.getElementById('gekozenUrl').value;
    const opmerking = document.getElementById('msg').value;

    let bericht = 'Hoi! Ik wil een aanvraag doen 🎮\n';

    if (selectedConsoles.length > 0) {
        const garantie = state.garantie || { label: '90 Dagen Garantie', prijs: 0 };
        bericht += `\n🔧 Modchip Installatie`;
        selectedConsoles.forEach(c => {
            const m = c.method ? ` (${c.method})` : '';
            bericht += `\n• ${c.label}${m} (€ ${c.prijs},-)`;
        });
        bericht += `\nGarantie: ${garantie.label}`;
        if (garantie.prijs > 0) bericht += ` (+ € ${garantie.prijs},-)`;
    }

    if (selectedRepairs.size > 0) {
        const byModel = new Map();
        selectedRepairs.forEach(r => {
            if (!byModel.has(r.model)) byModel.set(r.model, []);
            byModel.get(r.model).push(r);
        });
        const total = [...selectedRepairs.values()].reduce((s, r) => s + r.prijs, 0);
        bericht += `\n\n🛠 Reparatie`;
        byModel.forEach((repairs, model) => {
            bericht += `\n${model}:\n` + repairs.map(r => `• ${r.naam} (€ ${r.prijs},-)`).join('\n');
        });
        const repGarantie = state.repGarantie || { label: '90 Dagen Garantie', prijs: 0 };
        bericht += `\nGarantie: ${repGarantie.label}`;
        if (repGarantie.prijs > 0) bericht += ` (+ € ${repGarantie.prijs},-)`;
        bericht += `\nIndicatief totaal: ≈ € ${total},-`;
    }

    if (opmerking) bericht += `\n\nOpmerking: ${opmerking}`;

    let finalUrl = url;
    if (kanaal === 'telegram' || kanaal === 'whatsapp') {
        finalUrl = url + '?text=' + encodeURIComponent(bericht);
    }

    document.getElementById('modForm').classList.add('hidden');
    const successLink = document.getElementById('successLink');
    successLink.href  = finalUrl;
    successLink.className = 'btn-contact-large ' + kanaalKlassen[kanaal];
    document.getElementById('successIcon').className     = kanaalIcons[kanaal];
    document.getElementById('successKanaal').textContent = kanaalNamen[kanaal];
    document.getElementById('successMessage').classList.remove('hidden');
    document.getElementById('successMessage').scrollIntoView({ behavior: 'smooth', block: 'center' });
});


// ============================================================
// HAMBURGER MENU
// ============================================================
const hamburger = document.getElementById('hamburger');
const mainNav   = document.getElementById('mainNav');
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mainNav.classList.toggle('open');
});
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mainNav.classList.remove('open');
    });
});


// ============================================================
// FAQ ACCORDION
// ============================================================
document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
        const item   = btn.parentElement;
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
    });
});


// ============================================================
// SCROLL ANIMATIONS
// ============================================================
const fadeEls = document.querySelectorAll('.card, .step, .review-card, .faq-item, .trust-item, .hero-stats, .rep-row');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
fadeEls.forEach(el => { el.classList.add('fade-in'); observer.observe(el); });


// ============================================================
// REVIEWS
// ============================================================
function loadReviews() {
    const reviews = [
        { naam: "Daan V.",   console: "Switch OLED", score: 5, tekst: "Mijn OLED werkt perfect. Netjes verpakt teruggestuurd, alles uitgelegd via Telegram. Echt een vakman." },
        { naam: "Kevin M.",  console: "Switch Lite",  score: 5, tekst: "Super snelle service. Binnen 2 dagen mijn Lite teruggestuurd met alles erop. Atmosphere werkte direct." },
        { naam: "Sander R.", console: "Switch V2",    score: 5, tekst: "Twijfelde eerst, maar de foto's van het soldeerwerk overtuigden me. Chip zit er netjes in en alles werkt." },
        { naam: "Luca B.",   console: "Switch OLED",  score: 5, tekst: "Communicatie was top, kreeg updates gedurende het hele proces. Switch werkt als een droom na de modchip." },
        { naam: "Tim H.",    console: "Switch V1",    score: 5, tekst: "Goede prijs, nette afwerking en snel terug. Precies wat ik zocht. Aanrader voor iedereen." }
    ];
    const grid = document.getElementById('reviewsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    reviews.forEach(r => {
        const stars = Array.from({length: 5}, (_, i) =>
            `<i class="fa-solid fa-star" style="color:${i < r.score ? '#f59e0b' : '#334155'}"></i>`
        ).join('');
        const card = document.createElement('div');
        card.classList.add('review-card', 'fade-in');
        card.innerHTML = `<div class="review-stars">${stars}</div><p>"${r.tekst}"</p><div class="review-author"><span class="review-name">${r.naam}</span><span class="review-model">${r.console}</span></div>`;
        grid.appendChild(card);
        setTimeout(() => card.classList.add('visible'), 50);
    });
}
loadReviews();
