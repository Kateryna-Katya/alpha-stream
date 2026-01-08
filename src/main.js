// Initialization
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Smooth Scroll (Lenis)
    const lenis = new Lenis();
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 2. Header Scroll Effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
    });

    // 3. Simple Mobile Menu (Placeholder for now)
    const menuToggle = document.querySelector('.menu-toggle');
    menuToggle.addEventListener('click', () => {
        alert('Мобильное меню в разработке. Будет добавлено при финальной полировке.');
    });

    console.log('Alpha Stream Phase 0-2: Loaded');
});