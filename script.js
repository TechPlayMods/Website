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
const kanaalLinks = {
    telegram: 'https://t.me/JOUW_TELEGRAM',
    whatsapp: 'https://wa.me/JOUW_WHATSAPP',
    reddit:   'https://reddit.com/u/JOUW_REDDIT',
    discord:  'https://discord.com/users/JOUW_DISCORD'
};

// Kanaal keuze knoppen
document.querySelectorAll('.kanaal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.kanaal-btn').forEach(b => b.classList.remove('geselecteerd'));
        btn.classList.add('geselecteerd');
        document.getElementById('gekozenKanaal').value = btn.dataset.kanaal;
    });
});

document.getElementById('modForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const kanaal = document.getElementById('gekozenKanaal').value;
    if (!kanaal) { alert('Kies eerst via welk kanaal je contact wilt opnemen.'); return; }

    document.getElementById('modForm').classList.add('hidden');
    const successBox = document.getElementById('successMessage');

    // Highlight gekozen kanaal knop in success box
    successBox.querySelectorAll('.btn-contact').forEach(btn => {
        btn.style.opacity = btn.classList.contains('btn-' + kanaal.slice(0,2)) ? '1' : '0.4';
    });

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
        const data = await res.json();
        const grid = document.getElementById('reviewsGrid');
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
