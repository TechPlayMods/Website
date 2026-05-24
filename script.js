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
document.getElementById('modForm').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('modForm').classList.add('hidden');
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


// --- REVIEW SYSTEEM ---
const GITHUB_USER = 'TechPlayMods';
const GITHUB_REPO = 'Website';
const GITHUB_FILE = 'reviews.json';
const GITHUB_TOKEN = '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';
const API_URL = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${GITHUB_FILE}`;

const starPicker = document.getElementById('starPicker');
const reviewScore = document.getElementById('reviewScore');
const reviewForm = document.getElementById('reviewForm');
const reviewsGrid = document.getElementById('reviewsGrid');
const reviewSuccess = document.getElementById('reviewSuccess');
const starLabel = document.getElementById('starLabel');
const charCount = document.getElementById('charCount');
const starLabels = ['', 'Slecht', 'Matig', 'Oké', 'Goed', 'Uitstekend!'];

// Karakter teller
document.getElementById('reviewTekst').addEventListener('input', function() {
    charCount.textContent = `${this.value.length} / 300`;
});

// Reviews laden van GitHub
async function loadReviews() {
    try {
        const res = await fetch(API_URL, {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        const content = JSON.parse(atob(data.content));
        content.reviews.forEach(r => renderReview(r));
    } catch(e) { console.log('Reviews laden mislukt:', e); }
}

// Review renderen
function renderReview(r) {
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
    reviewsGrid.appendChild(card);
    setTimeout(() => card.classList.add('visible'), 50);
}

// Review opslaan naar GitHub
async function saveReview(review) {
    try {
        // Haal huidig bestand op
        const res = await fetch(API_URL, {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });
        const data = await res.json();
        const sha = data.sha;
        const content = JSON.parse(atob(data.content));

        // Voeg nieuwe review toe
        content.reviews.push(review);

        // Sla op via GitHub API
        await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Nieuwe review toegevoegd',
                content: btoa(JSON.stringify(content, null, 2)),
                sha: sha
            })
        });
        return true;
    } catch(e) {
        console.log('Opslaan mislukt:', e);
        return false;
    }
}

// Sterren interactie
let selectedScore = 0;
starPicker.querySelectorAll('i').forEach(star => {
    star.addEventListener('mouseover', () => {
        const val = parseInt(star.dataset.star);
        starPicker.querySelectorAll('i').forEach((s, i) => {
            s.className = i < val ? 'fa-solid fa-star active' : 'fa-regular fa-star';
        });
        starLabel.textContent = starLabels[val];
    });
    star.addEventListener('mouseout', () => {
        starPicker.querySelectorAll('i').forEach((s, i) => {
            s.className = i < selectedScore ? 'fa-solid fa-star active' : 'fa-regular fa-star';
        });
        starLabel.textContent = selectedScore ? starLabels[selectedScore] : 'Klik om te beoordelen';
    });
    star.addEventListener('click', () => {
        selectedScore = parseInt(star.dataset.star);
        reviewScore.value = selectedScore;
        starLabel.textContent = starLabels[selectedScore];
    });
});

// Formulier submit
reviewForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (selectedScore === 0) { alert('Geef een beoordeling met sterren.'); return; }

    const submitBtn = reviewForm.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Bezig met opslaan...';

    const review = {
        naam: document.getElementById('reviewNaam').value.trim(),
        console: document.getElementById('reviewConsole').value,
        score: selectedScore,
        tekst: document.getElementById('reviewTekst').value.trim(),
        datum: new Date().toLocaleDateString('nl-NL')
    };

    const ok = await saveReview(review);

    if (ok) {
        renderReview(review);
        reviewForm.reset();
        selectedScore = 0;
        starPicker.querySelectorAll('i').forEach(s => s.className = 'fa-regular fa-star');
        starLabel.textContent = 'Klik om te beoordelen';
        charCount.textContent = '0 / 300';
        reviewSuccess.classList.remove('hidden');
        setTimeout(() => reviewSuccess.classList.add('hidden'), 5000);
    } else {
        alert('Er ging iets mis. Probeer het opnieuw.');
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Review Plaatsen';
});

loadReviews();
