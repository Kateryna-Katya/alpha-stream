document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. GLOBAL SETUP ---
    gsap.registerPlugin(ScrollTrigger, TextPlugin);

    // Smooth Scroll (Lenis)
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true
    });
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Header Scroll Effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
    });


    // --- 1. HERO SECTION ANIMATION ---

    // 1.1 GSAP Content Reveal & Text Scramble
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    const scrambleText = document.querySelector('.scramble-text');
    const finalHeadline = scrambleText.innerHTML; // Сохраняем финальный HTML с вложенным спаном

    gsap.set(scrambleText, { visibility: 'visible' });

    heroTl
        // Эффект "взлома" текста. Используем delimiter: " " чтобы не ломать HTML теги внутри
        .to(scrambleText, {
            duration: 2.5,
            text: {
                value: finalHeadline,
                delimiter: "", // Scramble по буквам
                scrambleText: {
                    text: finalHeadline,
                    chars: "01_X$#@!-[]░▒▓█", // Хакерские символы
                    revealDelay: 0.5,
                    speed: 0.3,
                }
            },
        })
        // Появление подзаголовка и кнопок
        .to(['.hero__subtitle', '.hero__actions'], {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.2
        }, "-=1.5"); // Начинаем чуть раньше окончания скрамбла


    // 1.2 Three.js Interactive Grid Background
    function initThreeJsBackground() {
        const canvas = document.querySelector('#hero-canvas');
        if (!canvas) return;

        const scene = new THREE.Scene();
        // Темно-синий туман для глубины
        scene.fog = new THREE.FogExp2(0x0a0b10, 0.0015); 

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 400;

        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // --- Particles & Lines Geometry ---
        const particleCount = 150; // Количество точек
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const originalPositions = new Float32Array(particleCount * 3); // Для возврата в исходное положение

        // Генерация случайных позиций в объеме
        for (let i = 0; i < particleCount * 3; i += 3) {
            const x = Math.random() * 800 - 400;
            const y = Math.random() * 800 - 400;
            const z = Math.random() * 800 - 400;
            positions[i] = x;
            positions[i + 1] = y;
            positions[i + 2] = z;
            originalPositions[i] = x;
            originalPositions[i + 1] = y;
            originalPositions[i + 2] = z;
        }
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Материал для точек
        const particleMaterial = new THREE.PointsMaterial({
            color: 0x3b82f6, // Primary blue
            size: 4,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        const particleSystem = new THREE.Points(particles, particleMaterial);
        scene.add(particleSystem);

        // Материал для линий
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x10b981, // Accent emerald
            transparent: true,
            opacity: 0.15
        });
        // Геометрия линий (будет обновляться в цикле)
        const lineGeometry = new THREE.BufferGeometry();
        const linePositions = new Float32Array(particleCount * particleCount * 3); // Макс. кол-во связей
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
        const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        scene.add(lines);


        // --- Mouse Interaction ---
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;
        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;

        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX - windowHalfX);
            mouseY = (event.clientY - windowHalfY);
        });

        // --- Animation Loop ---
        function animate() {
            requestAnimationFrame(animate);

            targetX = mouseX * 0.001;
            targetY = mouseY * 0.001;

            // Легкое вращение всей системы от мыши
            particleSystem.rotation.y += 0.002 + (targetX - particleSystem.rotation.y) * 0.05;
            particleSystem.rotation.x += (targetY - particleSystem.rotation.x) * 0.05;
            lines.rotation.copy(particleSystem.rotation);

            const positions = particleSystem.geometry.attributes.position.array;
            const linePositions = lines.geometry.attributes.position.array;
            let lineIndex = 0;
            let connections = 0;
            
            // Обновление позиций точек (волновой эффект)
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                // Небольшое движение "дыхания"
                positions[i3 + 1] = originalPositions[i3 + 1] + Math.sin((Date.now() * 0.001 + originalPositions[i3] * 0.01)) * 20;
                
                // Создание связей между близкими точками
                for (let j = i + 1; j < particleCount; j++) {
                    const j3 = j * 3;
                    const dx = positions[i3] - positions[j3];
                    const dy = positions[i3 + 1] - positions[j3 + 1];
                    const dz = positions[i3 + 2] - positions[j3 + 2];
                    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

                    if (dist < 120) { // Дистанция соединения
                        linePositions[lineIndex++] = positions[i3];
                        linePositions[lineIndex++] = positions[i3 + 1];
                        linePositions[lineIndex++] = positions[i3 + 2];
                        linePositions[lineIndex++] = positions[j3];
                        linePositions[lineIndex++] = positions[j3 + 1];
                        linePositions[lineIndex++] = positions[j3 + 2];
                        connections++;
                    }
                }
            }
            
            particleSystem.geometry.attributes.position.needsUpdate = true;
            lines.geometry.setDrawRange(0, connections * 2);
            lines.geometry.attributes.position.needsUpdate = true;

            renderer.render(scene, camera);
        }

        // --- Resize Handler ---
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        animate();
    }

    // Запуск Three.js только на десктопах для производительности, или упростить для мобильных
    if (window.innerWidth > 768) {
       initThreeJsBackground();
    } else {
        // Фоллбэк для мобильных (можно заменить на статичную картинку в CSS)
        document.querySelector('#hero-canvas').style.background = 'radial-gradient(circle at center, #141620 0%, #0a0b10 70%)';
    }

   // --- 2. UNIVERSAL SCRAMBLE FOR ALL SECTIONS ---
    // Ищем все элементы .scramble-text, КРОМЕ уже анимированного в Hero
    const otherScrambleTexts = document.querySelectorAll('.scramble-text:not(.hero__title)');

    otherScrambleTexts.forEach(textElement => {
        const finalContent = textElement.innerHTML;
        
        // Скрываем текст до начала анимации
        gsap.set(textElement, { opacity: 0 });

        ScrollTrigger.create({
            trigger: textElement,
            start: "top 85%", // Запуск, когда заголовок внизу экрана
            onEnter: () => {
                gsap.set(textElement, { opacity: 1 });
                gsap.to(textElement, {
                    duration: 1.5,
                    text: {
                        value: finalContent,
                        delimiter: "",
                        scrambleText: {
                            text: finalContent,
                            chars: "01_X$#@!-[]░▒▓█",
                            revealDelay: 0.2,
                            speed: 0.4,
                        }
                    }
                });
            }
        });
    });

    // Анимация терминала (легкое парение)
    gsap.to('.terminal', {
        y: -15,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
    });
    // --- 3. BENEFITS SPOTLIGHT EFFECT ---
    const cards = document.querySelectorAll('.benefit-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // Анимация появления карточек (Stagger)
    gsap.from('.benefit-card', {
        scrollTrigger: {
            trigger: '.benefits__grid',
            start: 'top 80%'
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out"
    });
});