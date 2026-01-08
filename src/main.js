/**
 * Alpha Stream - IT School Project
 * Full Interactive Logic 2026
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. ИНИЦИАЛИЗАЦИЯ ПЛАГИНОВ ---
    gsap.registerPlugin(ScrollTrigger, TextPlugin);

    // Плавный скролл (Lenis)
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        orientation: 'vertical',
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // --- 2. НАВИГАЦИЯ И МОБИЛЬНОЕ МЕНЮ ---
    const header = document.querySelector('.header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav__link');

    // Липкий хедер при скролле
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
    });

    // Переключение мобильного меню
    const toggleMenu = () => {
        menuToggle.classList.toggle('menu-toggle--active');
        mobileMenu.classList.toggle('mobile-menu--active');
        // Блокируем скролл при открытом меню
        document.body.style.overflow = mobileMenu.classList.contains('mobile-menu--active') ? 'hidden' : '';
    };

    menuToggle.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => link.addEventListener('click', toggleMenu));


    // --- 3. HERO: ТЕХНОЛОГИЧНЫЙ 3D ФОН (Three.js) ---
    const initHero3D = () => {
        const canvas = document.querySelector('#hero-canvas');
        if (!canvas || window.innerWidth < 768) return;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x0a0b10, 0.0012);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 450;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Геометрия частиц
        const count = 160;
        const posArray = new Float32Array(count * 3);
        const originalPos = new Float32Array(count * 3);

        for (let i = 0; i < count * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 900;
            originalPos[i] = posArray[i];
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        const material = new THREE.PointsMaterial({
            color: 0x3b82f6,
            size: 4,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        // Линии связи
        const lineMat = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.12 });
        const lineGeom = new THREE.BufferGeometry();
        const linePositions = new Float32Array(count * count * 3);
        lineGeom.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
        const lines = new THREE.LineSegments(lineGeom, lineMat);
        scene.add(lines);

        let mouseX = 0, mouseY = 0;
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX - window.innerWidth / 2) * 0.15;
            mouseY = (e.clientY - window.innerHeight / 2) * 0.15;
        });

        function animate() {
            requestAnimationFrame(animate);
            
            points.rotation.y += 0.0008;
            points.position.x += (mouseX - points.position.x) * 0.05;
            points.position.y += (-mouseY - points.position.y) * 0.05;
            lines.position.copy(points.position);
            lines.rotation.copy(points.rotation);

            const pos = points.geometry.attributes.position.array;
            const lPos = lines.geometry.attributes.position.array;
            let counter = 0, connect = 0;

            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                // Эффект "дыхания" точек
                pos[i3 + 1] = originalPos[i3 + 1] + Math.sin(Date.now() * 0.001 + originalPos[i3]) * 15;

                for (let j = i + 1; j < count; j++) {
                    const j3 = j * 3;
                    const d = Math.sqrt(Math.pow(pos[i3]-pos[j3], 2) + Math.pow(pos[i3+1]-pos[j3+1], 2));
                    if (d < 120) {
                        lPos[counter++] = pos[i3]; lPos[counter++] = pos[i3+1]; lPos[counter++] = pos[i3+2];
                        lPos[counter++] = pos[j3]; lPos[counter++] = pos[j3+1]; lPos[counter++] = pos[j3+2];
                        connect++;
                    }
                }
            }
            points.geometry.attributes.position.needsUpdate = true;
            lines.geometry.setDrawRange(0, connect * 2);
            lines.geometry.attributes.position.needsUpdate = true;
            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    };
    initHero3D();


    // --- 4. ЭФФЕКТ "ХАКЕРСКОГО" ТЕКСТА (Scramble) ---
    const scrambleAnimation = (target) => {
        const text = target.innerHTML;
        gsap.to(target, {
            duration: 1.8,
            visibility: 'visible',
            text: {
                value: text,
                scrambleText: { 
                    text: text, 
                    chars: "01_X$#@!", 
                    revealDelay: 0.4, 
                    speed: 0.3 
                }
            }
        });
    };

    // Для Hero (сразу после загрузки)
    const h1 = document.querySelector('.hero__title');
    if (h1) {
        gsap.set(h1, { visibility: 'hidden' });
        setTimeout(() => scrambleAnimation(h1), 400);
        gsap.to(['.hero__subtitle', '.hero__actions'], { opacity: 1, y: 0, stagger: 0.2, delay: 1.2 });
    }

    // Для всех остальных заголовков (при появлении)
    document.querySelectorAll('.scramble-text:not(.hero__title)').forEach(title => {
        ScrollTrigger.create({
            trigger: title,
            start: "top 85%",
            onEnter: () => scrambleAnimation(title)
        });
    });


    // --- 5. КОНТАКТНАЯ ФОРМА: ВАЛИДАЦИЯ И УСПЕХ ---
    const contactForm = document.getElementById('contact-form');
    const phoneField = document.getElementById('phone-input');
    const captchaLabel = document.getElementById('captcha-question');
    const captchaField = document.getElementById('captcha-answer');
    const successBox = document.getElementById('form-success');

    // Генерация капчи
    let val1 = Math.floor(Math.random() * 9) + 1;
    let val2 = Math.floor(Math.random() * 9) + 1;
    let sumResult = val1 + val2;
    if (captchaLabel) captchaLabel.innerText = `${val1} + ${val2}`;

    // Только цифры в телефоне
    phoneField?.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^\d]/g, '');
    });

    contactForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        // Проверка капчи
        if (parseInt(captchaField.value) !== sumResult) {
            alert('Неверный ответ на защитный вопрос!');
            return;
        }

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        submitBtn.innerText = 'Интеграция данных...';
        submitBtn.disabled = true;

        // Имитация AJAX
        setTimeout(() => {
            gsap.to(contactForm.querySelectorAll('.form__group, .form__captcha, .form__consent, .btn--full'), {
                opacity: 0,
                y: -15,
                stagger: 0.05,
                duration: 0.4,
                onComplete: () => {
                    // Скрываем элементы и показываем Success
                    contactForm.classList.add('form--sent');
                    successBox.style.display = 'flex';
                    gsap.fromTo(successBox, 
                        { opacity: 0, scale: 0.9, y: 10 }, 
                        { opacity: 1, scale: 1, y: 0, duration: 0.5 }
                    );
                }
            });
        }, 1400);
    });


    // --- 6. ДОПОЛНИТЕЛЬНЫЕ ИНТЕРАКТИВЫ ---

    // Spotlight эффект на карточках преимуществ
    document.querySelectorAll('.benefit-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
        });
    });

    // Горизонтальный скролл (Инновации)
    const trackScroll = document.querySelector('.innovations__track');
    if (trackScroll && window.innerWidth > 1024) {
        gsap.to(trackScroll, {
            x: () => -(trackScroll.scrollWidth - window.innerWidth + 100),
            ease: "none",
            scrollTrigger: {
                trigger: ".innovations",
                start: "top top",
                end: () => `+=${trackScroll.scrollWidth}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true
            }
        });
    }

    // Парящее изображение в блоге
    const blogFollow = document.querySelector('.blog-hover-img');
    document.querySelectorAll('.blog-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            blogFollow.querySelector('img').src = item.dataset.img;
            gsap.to(blogFollow, { opacity: 1, scale: 1, duration: 0.3 });
        });
        item.addEventListener('mouseleave', () => gsap.to(blogFollow, { opacity: 0, scale: 0.8 }));
        item.addEventListener('mousemove', (e) => {
            gsap.to(blogFollow, { x: e.clientX + 20, y: e.clientY - 100, duration: 0.5 });
        });
    });

    // Система Cookie
    const cookieUI = document.getElementById('cookie-popup');
    if (!localStorage.getItem('alpha_policy_accepted')) {
        setTimeout(() => cookieUI?.classList.add('cookie-popup--active'), 3000);
    }
    document.getElementById('cookie-accept')?.addEventListener('click', () => {
        localStorage.setItem('alpha_policy_accepted', 'true');
        cookieUI.classList.remove('cookie-popup--active');
    });

    console.log('Alpha Stream Core: System Active');
});