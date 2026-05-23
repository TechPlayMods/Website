// --- CAROUSEL LOGICA ---
const slides = document.querySelectorAll('.carousel-slide');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const dotsContainer = document.getElementById('carouselDots');

let currentSlide = 0;
const slideIntervalTime = 5000; // Switcht automatisch elke 5 seconden
let slideInterval;

// Genereer dynamisch de indicator stipjes onderaan
slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
        goToSlide(index);
        resetTimer();
    });
    dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.dot');

function updateSliders() {
    slides.forEach((slide, index) => {
        if (index === currentSlide) {
            slide.classList.add('active');
            dots[index].classList.add('active');
        } else {
            slide.classList.remove('active');
            dots[index].classList.remove('active');
        }
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    updateSliders();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSliders();
}

function goToSlide(index) {
    currentSlide = index;
    updateSliders();
}

function startTimer() {
    slideInterval = setInterval(nextSlide, slideIntervalTime);
}

function resetTimer() {
    clearInterval(slideInterval);
    startTimer();
}

// Event Listeners voor de knoppen
nextBtn.addEventListener('click', () => {
    nextSlide();
    resetTimer();
});

prevBtn.addEventListener('click', () => {
    prevSlide();
    resetTimer();
});

// Start de automatische slider
startTimer();


// --- INTAKE FORMULIER LOGICA ---
document.getElementById('modForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const gekozenConsole = document.getElementById('console').value;
    const opmerking = document.getElementById('msg').value;

    // Verberg het invoerformulier
    document.getElementById('modForm').classList.add('hidden');

    // Toon de verborgen succesbox met de anonieme Telegram link
    const successBox = document.getElementById('successMessage');
    successBox.classList.remove('hidden');
    
    // Scroll automatisch soepel naar de geopende succesbox
    successBox.scrollIntoView({ behavior: 'smooth' });
});


// --- HAMBURGER MENU ---
const hamburger = document.getElementById('hamburger');
const mainNav = document.getElementById('mainNav');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mainNav.classList.toggle('open');
});

// Sluit menu bij klikken op een link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mainNav.classList.remove('open');
    });
});
