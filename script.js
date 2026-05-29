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

// Touch/swipe support voor carousel
let touchStartX = 0;
const carouselEl = document.querySelector('.carousel-slider');
carouselEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
carouselEl.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? nextSlide() : prevSlide(); resetTimer(); }
});

startTimer();


// --- INTAKE FORMULIER ---
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

const submitBtn = document.getElementById('submitBtn');
const submitHint = document.getElementById('submitHint');

// --- LIVE ORDER SUMMARY ---
const consoleSelect = document.getElementById('console');

const summaryConsoleRow  = document.getElementById('summaryConsoleRow');
const summaryConsoleName = document.getElementById('summaryConsoleName');
const summaryConsolePrice= document.getElementById('summaryConsolePrice');
const summaryPlaceholder = document.getElementById('summaryPlaceholder');
const summaryGarantieRow = document.getElementById('summaryGarantieRow');
const summaryGarantieName= document.getElementById('summaryGarantieName');
const summaryGarantiePrice=document.getElementById('summaryGarantiePrice');
const summaryTotalWrap   = document.getElementById('summaryTotalWrap');
const summaryTotal       = document.getElementById('summaryTotal');
const summaryIncludes    = document.getElementById('summaryIncludes');

function getSelectedGarantie() {
    const checked = document.querySelector('input[name="garantie"]:checked');
    return checked ? { dagen: checked.value, extra: parseInt(checked.dataset.extra) } : { dagen: '90', extra: 0 };
}

function updateSummary() {
    const selectedOption = consoleSelect.options[consoleSelect.selectedIndex];
    const hasConsole = consoleSelect.value !== '';

    if (!hasConsole) {
        summaryPlaceholder.style.display = '';
        summaryConsoleRow.style.display  = 'none';
        summaryGarantieRow.style.display = 'none';
        summaryTotalWrap.style.display   = 'none';
        summaryIncludes.style.display    = 'none';
        return;
    }

    const basisPrijs = parseInt(selectedOption.dataset.prijs);
    const garantie   = getSelectedGarantie();
    const totaal     = basisPrijs + garantie.extra;

    // Console row
    summaryPlaceholder.style.display  = 'none';
    summaryConsoleRow.style.display   = '';
    summaryConsoleName.textContent    = selectedOption.text.split(' — ')[0]; // just the model name
    summaryConsolePrice.textContent   = `€ ${basisPrijs},-`;

    // Garantie row
    summaryGarantieRow.style.display  = '';
    summaryGarantieName.textContent   = `${garantie.dagen} Dagen Garantie`;
    summaryGarantiePrice.textContent  = garantie.extra === 0 ? 'Inbegrepen' : `+ € ${garantie.extra},-`;
    // Gold colour for 180-day
    summaryGarantiePrice.style.color  = garantie.extra > 0 ? '#f59e0b' : '';

    // Total
    summaryTotalWrap.style.display    = '';
    summaryTotal.textContent          = `€ ${totaal},-`;

    // Includes checklist
    summaryIncludes.style.display     = '';
}

// Trigger on console change
consoleSelect.addEventListener('change', updateSummary);

// Trigger on warranty change
document.querySelectorAll('input[name="garantie"]').forEach(radio => {
    radio.addEventListener('change', updateSummary);
});

// Kanaal keuze — knop activeren
document.querySelectorAll('.kanaal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.kanaal-btn').forEach(b => b.classList.remove('geselecteerd'));
        btn.classList.add('geselecteerd');
        document.getElementById('gekozenKanaal').value = btn.dataset.kanaal;
        document.getElementById('gekozenUrl').value = btn.dataset.url;

        // Activeer de verzendknop + kleur wisselen + slotje weg
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
    const console_keuze= document.getElementById('console').value;
    const opmerking    = document.getElementById('msg').value;
    const garantie     = getSelectedGarantie();

    // Bouw bericht op
    let bericht = `Hoi! Ik wil een modchip laten installeren 🎮\n\nConsole: ${console_keuze}\nGarantie: ${garantie.dagen} dagen`;
    if (garantie.extra > 0) bericht += ` (+ € ${garantie.extra},-)`;
    if (opmerking) bericht += `\nOpmerking: ${opmerking}`;

    // Maak de link met vooraf ingevuld bericht waar mogelijk
    let finalUrl = url;
    if (kanaal === 'telegram' || kanaal === 'whatsapp') {
        finalUrl = url + '?text=' + encodeURIComponent(bericht);
    }

    // Verberg formulier
    document.getElementById('modForm').classList.add('hidden');

    // Update success box met gekozen kanaal
    const successLink = document.getElementById('successLink');
    successLink.href = finalUrl;
    successLink.className = 'btn-contact-large ' + kanaalKlassen[kanaal];
    document.getElementById('successIcon').className = kanaalIcons[kanaal];
    document.getElementById('successKanaal').textContent = kanaalNamen[kanaal];

    const successBox = document.getElementById('successMessage');
    successBox.classList.remove('hidden');
    successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
});


// --- HAMBURGER MENU ---
const hamburger = document.getElementById('hamburger');
const mainNav = document.getElementById('mainNav');

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


// --- FAQ ACCORDION ---
document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.parentElement;
        const isOpen = item.classList.contains('open');
        // Sluit alle andere
        document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
    });
});


// --- SCROLL ANIMATIES ---
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

// --- REVIEWS (inline data) ---
function loadReviews() {
    const reviews = [
        {
            naam: "Daan V.",
            console: "Switch OLED",
            score: 5,
            tekst: "Mijn OLED werkt perfect. Netjes verpakt teruggestuurd, alles uitgelegd via Telegram. Echt een vakman."
        },
        {
            naam: "Kevin M.",
            console: "Switch Lite",
            score: 5,
            tekst: "Super snelle service. Binnen 2 dagen mijn Lite teruggestuurd met alles erop. Atmosphere werkte direct."
        },
        {
            naam: "Sander R.",
            console: "Switch V2",
            score: 5,
            tekst: "Twijfelde eerst, maar de foto's van het soldeerwerk overtuigden me. Chip zit er netjes in en alles werkt."
        },
        {
            naam: "Luca B.",
            console: "Switch OLED",
            score: 5,
            tekst: "Communicatie was top, kreeg updates gedurende het hele proces. Switch werkt als een droom na de modchip."
        },
        {
            naam: "Tim H.",
            console: "Switch V1",
            score: 5,
            tekst: "Goede prijs, nette afwerking en snel terug. Precies wat ik zocht. Aanrader voor iedereen."
        }
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

// --- MODEL VOORINVULLEN VIA SERVICE KNOPPEN ---
document.querySelectorAll('.aanvragen-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const model = btn.dataset.model;
        const select = document.getElementById('console');
        if (select && model) {
            select.value = model;
            updateSummary(); // Refresh the live summary
        }
    });
});

loadReviews();
