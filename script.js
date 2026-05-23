document.addEventListener('DOMContentLoaded', () => {

    // --- CAROUSEL LOGICA ---
    const slides = document.querySelectorAll('.carousel-slide');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const dotsContainer = document.getElementById('carouselDots');

    if (slides.length > 0) {
        let currentSlide = 0;
        const slideIntervalTime = 5000;
        let slideInterval;

        // Genereer stipjes
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
                slide.classList.toggle('active', index === currentSlide);
                dots[index].classList.toggle('active', index === currentSlide);
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

        nextBtn.addEventListener('click', () => { nextSlide(); resetTimer(); });
        prevBtn.addEventListener('click', () => { prevSlide(); resetTimer(); });

        startTimer();

        // --- OPTIONEEL: Swipe ondersteuning voor mobiel ---
        let touchStartX = 0;
        document.querySelector('.carousel-container').addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });
        document.querySelector('.carousel-container').addEventListener('touchend', e => {
            let touchEndX = e.changedTouches[0].screenX;
            if (touchEndX < touchStartX - 50) nextSlide();
            if (touchEndX > touchStartX + 50) prevSlide();
            resetTimer();
        });
    }

    // --- INTAKE FORMULIER LOGICA ---
    const modForm = document.getElementById('modForm');
    if (modForm) {
        modForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Verberg het invoerformulier
            modForm.classList.add('hidden');

            // Toon succesbox
            const successBox = document.getElementById('successMessage');
            successBox.classList.remove('hidden');
            
            // Scroll soepel
            successBox.scrollIntoView({ behavior: 'smooth' });
        });
    }
});
