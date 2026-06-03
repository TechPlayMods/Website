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
    console:  null,   // { model, label, prijs }
    garantie: null,   // { dagen, label, prijs }
};
const selectedRepairs = new Map(); // key = 'model||naam' → { model, naam, prijs }


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

        document.querySelectorAll('.aanvragen-btn').forEach(b => {
            b.classList.remove('geselecteerd');
            b.innerHTML = 'Selecteer <i class="fa-solid fa-arrow-right"></i>';
            b.closest('.card').classList.remove('geselecteerd');
        });

        btn.classList.add('geselecteerd');
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Geselecteerd';
        btn.closest('.card').classList.add('geselecteerd');

        state.console  = { model: btn.dataset.model, label: btn.dataset.label, prijs: parseInt(btn.dataset.prijs) };
        state.garantie = null;

        document.querySelectorAll('.garantie-select-btn').forEach(b => {
            b.classList.remove('geselecteerd');
            b.innerHTML = 'Selecteer <i class="fa-solid fa-arrow-right"></i>';
        });

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
consoleSelect.addEventListener('change', () => {
    const opt = consoleSelect.options[consoleSelect.selectedIndex];
    if (consoleSelect.value) {
        state.console = { model: consoleSelect.value, label: opt.text.split(' — ')[0], prijs: parseInt(opt.dataset.prijs) };
    } else {
        state.console = null;
    }
    refreshAll();
});

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
    const hasConsole  = !!state.console;
    const hasGarantie = !!state.garantie;
    const hasRepairs  = selectedRepairs.size > 0;

    // Show garantie radio only after console chosen
    document.getElementById('garantieFormGroup').style.display = hasConsole ? '' : 'none';
    document.getElementById('moddingEmpty').style.display      = hasConsole ? 'none' : '';

    // Sync select
    if (state.console) consoleSelect.value = state.console.model;
    if (state.garantie) {
        const radio = document.querySelector(`input[name="garantie"][value="${state.garantie.dagen}"]`);
        if (radio) radio.checked = true;
    }

    // Status badges
    const moddingStatus   = document.getElementById('moddingStatus');
    const reparatieStatus = document.getElementById('reparatieStatus');

    if (hasConsole && hasGarantie) {
        moddingStatus.textContent = '✓ ' + state.console.label + ' + ' + state.garantie.dagen + 'd garantie';
        moddingStatus.className   = 'aanvraag-block-status aanvraag-block-status-done';
    } else if (hasConsole) {
        moddingStatus.textContent = state.console.label + ' — kies garantie';
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
            `<div class="rep-aanvraag-row rep-aanvraag-model-header"><span class="rep-aanvraag-label"><i class="${modelIcon(model)}"></i> ${model}</span></div>` +
            reps.map(r => `<div class="rep-aanvraag-row"><span class="rep-aanvraag-label"><i class="fa-solid fa-screwdriver-wrench"></i> ${r.naam.split('(')[0].trim()}</span><span class="rep-aanvraag-prijs-small">€ ${r.prijs},-</span></div>`).join('')
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
const stickyConsoleName  = document.getElementById('stickyConsoleName');
const stickyGarantieName = document.getElementById('stickyGarantieName');
const stickyGarantieIcon = document.getElementById('stickyGarantieIcon');
const stickyConsoleChip  = document.getElementById('stickyConsoleChip');
const stickyGarantieChip = document.getElementById('stickyGarantieChip');
const stickyRepairChip   = document.getElementById('stickyRepairChip');
const stickyRepairName   = document.getElementById('stickyRepairName');
const stickyTotal        = document.getElementById('stickyTotal');

function updateStickyBar() {
    const hasConsole  = !!state.console;
    const hasGarantie = !!state.garantie;
    const hasRepairs  = selectedRepairs.size > 0;

    if (!hasConsole && !hasRepairs) {
        stickyBar.classList.remove('visible');
        document.querySelectorAll('.sticky-chip-repair-item').forEach(c => c.remove());
        document.querySelectorAll('.sticky-aanvraag-btn').forEach(c => c.remove());
        return;
    }
    stickyBar.classList.add('visible');

    // Console chip — only for modding
    if (hasConsole) {
        stickyConsoleChip.style.display = '';
        stickyConsoleName.textContent = state.console.label;
        stickyConsoleChip.classList.add('selected');
    } else {
        stickyConsoleChip.style.display = 'none';
    }

    // Garantie chip — only for modding
    if (hasConsole) {
        stickyGarantieChip.style.display = '';
        if (hasGarantie) {
            stickyGarantieName.textContent = state.garantie.label;
            stickyGarantieChip.classList.add('selected');
            if (state.garantie.dagen === '180') {
                stickyGarantieIcon.className = 'fa-solid fa-shield';
                stickyGarantieChip.classList.remove('sticky-chip-garantie-90');
                stickyGarantieChip.classList.add('sticky-chip-garantie-180');
            } else {
                stickyGarantieIcon.className = 'fa-solid fa-shield-halved';
                stickyGarantieChip.classList.remove('sticky-chip-garantie-180');
                stickyGarantieChip.classList.add('sticky-chip-garantie-90');
            }
        } else {
            stickyGarantieName.textContent = 'Garantie kiezen →';
            stickyGarantieChip.classList.remove('selected', 'sticky-chip-garantie-90', 'sticky-chip-garantie-180');
            stickyGarantieIcon.className = 'fa-solid fa-shield-halved';
        }
    } else {
        stickyGarantieChip.style.display = 'none';
    }

    // Remove old dynamic repair chips and aanvraag btn
    document.querySelectorAll('.sticky-chip-repair-item').forEach(c => c.remove());
    document.querySelectorAll('.sticky-aanvraag-btn').forEach(c => c.remove());

    // One chip per model, with count if multiple repairs for that model
    if (hasRepairs) {
        stickyRepairChip.style.display = 'none'; // hide template chip

        // Group by model
        const byModel = new Map();
        selectedRepairs.forEach(r => {
            if (!byModel.has(r.model)) byModel.set(r.model, []);
            byModel.get(r.model).push(r.naam.split('(')[0].trim());
        });

        const modelColors = {
            'Switch V1 / V2':          { bg: '#00ff88', color: '#000' },
            'Nintendo Switch V1 / V2': { bg: '#00ff88', color: '#000' },
            'Switch Lite':             { bg: '#e040fb', color: '#fff' },
            'Nintendo Switch Lite':    { bg: '#e040fb', color: '#fff' },
            'Switch OLED':             { bg: '#fb923c', color: '#000' },
            'Nintendo Switch OLED':    { bg: '#fb923c', color: '#000' },
        };

        // V1/V2 = green, Lite = pink/purple, OLED = orange
        const getColor = (model) => {
            if (model.includes('V1') || model.includes('V2')) return { bg: '#00ff88', color: '#000' };
            if (model.includes('Lite')) return { bg: '#e040fb', color: '#fff' };
            return { bg: '#fb923c', color: '#000' }; // OLED = orange
        };

        const chipsContainer = document.querySelector('.sticky-chips');
        byModel.forEach((names, model) => {
            const count = names.length;
            const label = count === 1 ? '1 reparatie' : count + ' reparaties';
            const { bg, color } = getColor(model);
            const chip = document.createElement('div');
            chip.className = 'sticky-chip sticky-chip-repair-item';
            chip.style.cssText = `background:${bg};color:${color};border-color:${bg};`;
            chip.innerHTML = `<i class="fa-solid fa-screwdriver-wrench"></i><span>${label}</span>`;
            chipsContainer.appendChild(chip);
        });
    } else {
        stickyRepairChip.style.display = 'none';
    }

    // Total
    let total = 0;
    if (hasConsole) total += state.console.prijs;
    if (hasGarantie) total += state.garantie.prijs;
    selectedRepairs.forEach(r => total += r.prijs);
    const prefix = hasRepairs && (!hasConsole || !hasGarantie) ? '≈ ' : '';
    const totalStr = prefix + '€ ' + total + ',-';

    // Always show aanvraag button with price embedded
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
    const hasConsole  = !!state.console;
    const hasGarantie = !!state.garantie;
    const hasRepairs  = selectedRepairs.size > 0;
    const hasAnything = hasConsole || hasRepairs;

    document.getElementById('summaryPlaceholder').style.display    = hasAnything ? 'none' : '';
    document.getElementById('summaryConsoleRow').style.display     = hasConsole ? '' : 'none';
    document.getElementById('summaryGarantieRow').style.display    = hasGarantie ? '' : 'none';
    document.getElementById('summaryGarantiePending').style.display= (hasConsole && !hasGarantie) ? '' : 'none';
    document.getElementById('summaryTotalWrap').style.display      = hasAnything ? '' : 'none';
    document.getElementById('summaryIncludes').style.display       = hasAnything ? '' : 'none';

    if (hasConsole) {
        document.getElementById('summaryConsoleName').textContent  = state.console.label;
        document.getElementById('summaryConsolePrice').textContent = '€ ' + state.console.prijs + ',-';
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
            // Model header row if multiple models
            if (byModel.size > 1) {
                const header = document.createElement('div');
                header.className = 'order-row-model-header';
                header.innerHTML = `<i class="fa-solid fa-gamepad"></i> ${model}`;
                repContainer.appendChild(header);
            }
            repairs.forEach(r => {
                const row = document.createElement('div');
                row.className = 'order-row order-row-repair';
                row.innerHTML = `<div class="order-row-label"><i class="fa-solid fa-screwdriver-wrench"></i><span>${r.naam.split('(')[0].trim()}</span></div><span class="order-row-prijs">€ ${r.prijs},-</span>`;
                repContainer.appendChild(row);
            });
        });
    }

    // Total
    let total = 0;
    if (hasConsole)  total += state.console.prijs;
    if (hasGarantie) total += state.garantie.prijs;
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

    if (state.console) {
        const garantie = state.garantie || { label: '90 Dagen Garantie', prijs: 0 };
        bericht += `\n🔧 Modchip Installatie\nConsole: ${state.console.label}\nGarantie: ${garantie.label}`;
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
