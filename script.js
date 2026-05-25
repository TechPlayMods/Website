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

// Kanaal keuze — knop activeren
document.querySelectorAll('.kanaal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.kanaal-btn').forEach(b => b.classList.remove('geselecteerd'));
        btn.classList.add('geselecteerd');
        document.getElementById('gekozenKanaal').value = btn.dataset.kanaal;
        document.getElementById('gekozenUrl').value = btn.dataset.url;

        // Activeer de verzendknop + update kleur
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn-submit-disabled');
        submitHint.classList.add('hidden');

        // Kleur wisselen op basis van gekozen kanaal
        submitBtn.classList.remove('kleur-tg', 'kleur-wa', 'kleur-rd', 'kleur-dc');
        submitBtn.classList.add('kleur-' + kanaalKlassen[btn.dataset.kanaal]);
    });
});

document.getElementById('modForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const kanaal = document.getElementById('gekozenKanaal').value;
    const url = document.getElementById('gekozenUrl').value;
    const console_keuze = document.getElementById('console').value;
    const opmerking = document.getElementById('msg').value;

    // Bouw bericht op
    let bericht = `Hoi! Ik wil een modchip laten installeren 🎮

Console: ${console_keuze}`;
    if (opmerking) bericht += `
Opmerking: ${opmerking}`;

    // Maak de link met vooraf ingevuld bericht waar mogelijk
    let finalUrl = url;
    if (kanaal === 'telegram') {
        finalUrl = url + '?text=' + encodeURIComponent(bericht);
    } else if (kanaal === 'whatsapp') {
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

// --- REVIEWS LADEN UIT reviews.json ---
async function loadReviews() {
    try {
        const res = await fetch('reviews.json');
        if (!res.ok) return;
        const data = await res.json();
        const grid = document.getElementById('reviewsGrid');
        if (!grid) return;
        grid.innerHTML = '';
        data.reviews.forEach(r => {
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
    } catch(e) {
        console.log('Reviews laden mislukt:', e);
    }
}

loadReviews();
