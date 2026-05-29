// --- CAROUSEL ---
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
// SELECTION STATE
// ============================================================
const state = {
    console: null,   // { model, label, prijs }
    garantie: null   // { dagen, label, prijs }
};


// ============================================================
// STICKY BAR
// ============================================================
const stickyBar         = document.getElementById('stickySelection');
const stickyConsoleName = document.getElementById('stickyConsoleName');
const stickyGarantieName= document.getElementById('stickyGarantieName');
const stickyConsoleChip = document.getElementById('stickyConsoleChip');
const stickyGarantieChip= document.getElementById('stickyGarantieChip');
const stickyTotal       = document.getElementById('stickyTotal');
const stickySep         = document.getElementById('stickySep');

function updateStickyBar() {
    if (!state.console) {
        stickyBar.classList.remove('visible');
        return;
    }
    stickyBar.classList.add('visible');

    // Console chip
    stickyConsoleName.textContent = state.console.label;
    stickyConsoleChip.classList.add('selected');

    // Garantie chip
    if (state.garantie) {
        stickyGarantieName.textContent = state.garantie.label;
        stickyGarantieChip.classList.add('selected');
        const totaal = state.console.prijs + state.garantie.prijs;
        stickyTotal.textContent = '€ ' + totaal + ',-';
    } else {
        stickyGarantieName.textContent = 'Garantie kiezen →';
        stickyGarantieChip.classList.remove('selected');
        stickyTotal.textContent = '';
    }
}


// ============================================================
// ORDER SUMMARY PANEL (at contact section)
// ============================================================
const summaryConsoleRow     = document.getElementById('summaryConsoleRow');
const summaryConsoleName    = document.getElementById('summaryConsoleName');
const summaryConsolePrice   = document.getElementById('summaryConsolePrice');
const summaryPlaceholder    = document.getElementById('summaryPlaceholder');
const summaryGarantieRow    = document.getElementById('summaryGarantieRow');
const summaryGarantiePending= document.getElementById('summaryGarantiePending');
const summaryGarantieName   = document.getElementById('summaryGarantieName');
const summaryGarantiePrice  = document.getElementById('summaryGarantiePrice');
const summaryTotalWrap      = document.getElementById('summaryTotalWrap');
const summaryTotal          = document.getElementById('summaryTotal');
const summaryIncludes       = document.getElementById('summaryIncludes');

function updateOrderSummary() {
    if (!state.console) {
        summaryPlaceholder.style.display    = '';
        summaryConsoleRow.style.display     = 'none';
        summaryGarantieRow.style.display    = 'none';
        summaryGarantiePending.style.display= 'none';
        summaryTotalWrap.style.display      = 'none';
        summaryIncludes.style.display       = 'none';
        return;
    }

    // Console chosen
    summaryPlaceholder.style.display  = 'none';
    summaryConsoleRow.style.display   = '';
    summaryConsoleName.textContent    = state.console.label;
    summaryConsolePrice.textContent   = '€ ' + state.console.prijs + ',-';

    if (!state.garantie) {
        // Console chosen, garantie not yet
        summaryGarantieRow.style.display    = 'none';
        summaryGarantiePending.style.display= '';
        summaryTotalWrap.style.display      = 'none';
        summaryIncludes.style.display       = 'none';
        return;
    }

    // Both chosen
    summaryGarantiePending.style.display= 'none';
    summaryGarantieRow.style.display    = '';
    summaryGarantieName.textContent     = state.garantie.label;
    summaryGarantiePrice.textContent    = state.garantie.prijs === 0 ? 'Inbegrepen' : '+ € ' + state.garantie.prijs + ',-';
    summaryGarantiePrice.style.color    = state.garantie.prijs > 0 ? '#f59e0b' : '';

    const totaal = state.console.prijs + state.garantie.prijs;
    summaryTotalWrap.style.display  = '';
    summaryTotal.textContent        = '€ ' + totaal + ',-';
    summaryIncludes.style.display   = '';
}

// Also sync the hidden form fields & radio buttons to match state
function syncFormToState() {
    const select = document.getElementById('console');
    if (state.console && select) select.value = state.console.model;

    if (state.garantie) {
        const radio = document.querySelector(`input[name="garantie"][value="${state.garantie.dagen}"]`);
        if (radio) radio.checked = true;
    }
}

function refreshAll() {
    updateStickyBar();
    updateOrderSummary();
    syncFormToState();
}


// ============================================================
// SERVICE CARD BUTTONS → select console, scroll to garantie
// ============================================================
document.querySelectorAll('.aanvragen-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();

        // Deselect all service cards & their buttons
        document.querySelectorAll('.aanvragen-btn').forEach(b => {
            b.classList.remove('geselecteerd');
            b.textContent = 'Selecteer ';
            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-arrow-right';
            b.appendChild(icon);
            b.closest('.card').classList.remove('geselecteerd');
        });

        // Select this one
        btn.classList.add('geselecteerd');
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Geselecteerd';
        btn.closest('.card').classList.add('geselecteerd');

        // Save state
        state.console = {
            model: btn.dataset.model,
            label: btn.dataset.label,
            prijs: parseInt(btn.dataset.prijs)
        };
        // Reset garantie when console changes
        state.garantie = null;
        document.querySelectorAll('.garantie-select-btn').forEach(b => {
            b.classList.remove('geselecteerd');
            b.innerHTML = 'Selecteer <i class="fa-solid fa-arrow-right"></i>';
        });

        refreshAll();

        // Scroll to garantie section
        document.getElementById('garantie').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});


// ============================================================
// GARANTIE CARD BUTTONS → select garantie, scroll to contact
// ============================================================
document.querySelectorAll('.garantie-select-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();

        // Deselect all garantie buttons
        document.querySelectorAll('.garantie-select-btn').forEach(b => {
            b.classList.remove('geselecteerd');
            b.innerHTML = 'Selecteer <i class="fa-solid fa-arrow-right"></i>';
        });

        // Select this one
        btn.classList.add('geselecteerd');
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Geselecteerd';

        // Save state
        state.garantie = {
            dagen: btn.dataset.garantie,
            label: btn.dataset.garantieLabel,
            prijs: parseInt(btn.dataset.garantiePrijs)
        };

        refreshAll();

        // Scroll to contact section
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});


// ============================================================
// FORM — also sync state when dropdowns/radios changed manually
// ============================================================
const consoleSelect = document.getElementById('console');
consoleSelect.addEventListener('change', () => {
    const opt = consoleSelect.options[consoleSelect.selectedIndex];
    if (consoleSelect.value) {
        state.console = {
            model: consoleSelect.value,
            label: opt.text.split(' — ')[0],
            prijs: parseInt(opt.dataset.prijs)
        };
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
// KANAAL & SUBMIT
// ============================================================
const kanaalIcons = {
    telegram: 'fa-brands fa-telegram',
    whatsapp: 'fa-brands fa-whatsapp',
    reddit:   'fa-brands fa-reddit',
    discord:  'fa-brands fa-discord'
};
const kanaalNamen = {
    telegram: 'Verder via Telegram',
    whatsapp: 'Verder via WhatsApp',
    reddit:   'Verder via Reddit',
    discord:  'Verder via Discord'
};
const kanaalKlassen = {
    telegram: 'tg',
    whatsapp: 'wa',
    reddit:   'rd',
    discord:  'dc'
};

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

    const kanaal       = document.getElementById('gekozenKanaal').value;
    const url          = document.getElementById('gekozenUrl').value;
    const opmerking    = document.getElementById('msg').value;
    const garantie     = state.garantie || { dagen: '90', label: '90 Dagen Garantie', prijs: 0 };
    const console_keuze= state.console ? state.console.label : consoleSelect.value;

    let bericht = `Hoi! Ik wil een modchip laten installeren 🎮\n\nConsole: ${console_keuze}\nGarantie: ${garantie.label}`;
    if (garantie.prijs > 0) bericht += ` (+ € ${garantie.prijs},-)`;
    if (opmerking) bericht += `\nOpmerking: ${opmerking}`;

    let finalUrl = url;
    if (kanaal === 'telegram' || kanaal === 'whatsapp') {
        finalUrl = url + '?text=' + encodeURIComponent(bericht);
    }

    document.getElementById('modForm').classList.add('hidden');

    const successLink = document.getElementById('successLink');
    successLink.href = finalUrl;
    successLink.className = 'btn-contact-large ' + kanaalKlassen[kanaal];
    document.getElementById('successIcon').className  = kanaalIcons[kanaal];
    document.getElementById('successKanaal').textContent = kanaalNamen[kanaal];

    const successBox = document.getElementById('successMessage');
    successBox.classList.remove('hidden');
    successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
const fadeEls = document.querySelectorAll('.card, .step, .review-card, .faq-item, .trust-item, .hero-stats');
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
        { naam: "Daan V.",  console: "Switch OLED", score: 5, tekst: "Mijn OLED werkt perfect. Netjes verpakt teruggestuurd, alles uitgelegd via Telegram. Echt een vakman." },
        { naam: "Kevin M.", console: "Switch Lite",  score: 5, tekst: "Super snelle service. Binnen 2 dagen mijn Lite teruggestuurd met alles erop. Atmosphere werkte direct." },
        { naam: "Sander R.",console: "Switch V2",    score: 5, tekst: "Twijfelde eerst, maar de foto's van het soldeerwerk overtuigden me. Chip zit er netjes in en alles werkt." },
        { naam: "Luca B.",  console: "Switch OLED",  score: 5, tekst: "Communicatie was top, kreeg updates gedurende het hele proces. Switch werkt als een droom na de modchip." },
        { naam: "Tim H.",   console: "Switch V1",    score: 5, tekst: "Goede prijs, nette afwerking en snel terug. Precies wat ik zocht. Aanrader voor iedereen." }
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
        card.innerHTML = `
            <div class="review-stars">${stars}</div>
            <p>"${r.tekst}"</p>
            <div class="review-author">
                <span class="review-name">${r.naam}</span>
                <span class="review-model">${r.console}</span>
            </div>`;
        grid.appendChild(card);
        setTimeout(() => card.classList.add('visible'), 50);
    });
}

loadReviews();
