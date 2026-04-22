/* ============================================
   MAIN JAVASCRIPT
   Core functionality & interactivity
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ========================================
    // LOADING SCREEN
    // ========================================
    const loadingScreen = document.getElementById('loadingScreen');
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            document.body.classList.add('loaded');
            
            // Remove loading screen from DOM after animation
            setTimeout(() => {
                loadingScreen.remove();
            }, 600);
        }, 1500);
    });
    
    // Fallback: hide loading screen after 4 seconds max
    setTimeout(() => {
        if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
            loadingScreen.classList.add('hidden');
            document.body.classList.add('loaded');
        }
    }, 4000);

    // ========================================
    // CURSOR GLOW EFFECT
    // ========================================
    const cursorGlow = document.getElementById('cursorGlow');
    
    if (cursorGlow && window.matchMedia('(hover: hover)').matches) {
        let mouseX = 0, mouseY = 0;
        let glowX = 0, glowY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorGlow.classList.add('active');
        });
        
        document.addEventListener('mouseleave', () => {
            cursorGlow.classList.remove('active');
        });
        
        // Smooth follow with lerp
        function animateCursor() {
            glowX += (mouseX - glowX) * 0.08;
            glowY += (mouseY - glowY) * 0.08;
            
            cursorGlow.style.left = glowX + 'px';
            cursorGlow.style.top = glowY + 'px';
            
            requestAnimationFrame(animateCursor);
        }
        animateCursor();
    }

    // ========================================
    // NAVBAR
    // ========================================
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Scroll effect
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScrollY = currentScrollY;
    });
    
    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
    }
    
    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Active section highlighting
    const sections = document.querySelectorAll('section[id]');
    
    function updateActiveNav() {
        const scrollY = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-section') === sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveNav);

    // ========================================
    // SMOOTH SCROLL
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = target.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========================================
    // TYPING EFFECT
    // ========================================
    class TypeWriter {
        constructor(element, words, options = {}) {
            this.element = element;
            this.words = words;
            this.speed = options.speed || 80;
            this.deleteSpeed = options.deleteSpeed || 40;
            this.waitTime = options.waitTime || 2000;
            this.wordIndex = 0;
            this.charIndex = 0;
            this.isDeleting = false;
            this.type();
        }
        
        type() {
            const current = this.words[this.wordIndex];
            
            if (this.isDeleting) {
                this.charIndex--;
                this.element.textContent = current.substring(0, this.charIndex);
            } else {
                this.charIndex++;
                this.element.textContent = current.substring(0, this.charIndex);
            }
            
            let typeSpeed = this.isDeleting ? this.deleteSpeed : this.speed;
            
            if (!this.isDeleting && this.charIndex === current.length) {
                typeSpeed = this.waitTime;
                this.isDeleting = true;
            } else if (this.isDeleting && this.charIndex === 0) {
                this.isDeleting = false;
                this.wordIndex = (this.wordIndex + 1) % this.words.length;
                typeSpeed = 500;
            }
            
            setTimeout(() => this.type(), typeSpeed);
        }
    }
    
    const typingElement = document.getElementById('typingText');
    if (typingElement) {
        new TypeWriter(typingElement, [
            'Front-End Web Developer',
            'Fresh Graduate S.Kom.',
            'IT Troubleshooter',
            'Problem Solver',
            'Fast Learner'
        ], {
            speed: 80,
            deleteSpeed: 40,
            waitTime: 2500
        });
    }

    // ========================================
    // PROJECT FILTERS
    // ========================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            projectCards.forEach((card, index) => {
                const category = card.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 100);
                } else {
                    card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        card.classList.add('hidden');
                    }, 300);
                }
            });
        });
    });

    // ========================================
    // CONTACT FORM
    // ========================================
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('.btn-submit');
            submitBtn.classList.add('loading');
            
            // Simulate form submission
            setTimeout(() => {
                submitBtn.classList.remove('loading');
                
                // Show success message
                showNotification('Pesan berhasil dikirim! Terima kasih telah menghubungi saya.', 'success');
                
                // Reset form
                this.reset();
            }, 2000);
        });
    }

    // ========================================
    // NOTIFICATION SYSTEM
    // ========================================
    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="ph ph-${type === 'success' ? 'check-circle' : 'info'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="ph ph-x"></i>
            </button>
        `;
        
        // Styles
        Object.assign(notification.style, {
            position: 'fixed',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%) translateY(100px)',
            zIndex: '10000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            padding: '16px 24px',
            background: type === 'success' ? 'rgba(0, 245, 212, 0.15)' : 'rgba(123, 47, 247, 0.15)',
            border: `1px solid ${type === 'success' ? 'rgba(0, 245, 212, 0.3)' : 'rgba(123, 47, 247, 0.3)'}`,
            borderRadius: '12px',
            backdropFilter: 'blur(20px)',
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            maxWidth: '500px',
            width: 'calc(100% - 40px)',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        });
        
        const notifContent = notification.querySelector('.notification-content');
        Object.assign(notifContent.style, {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        });
        
        const notifIcon = notifContent.querySelector('i');
        Object.assign(notifIcon.style, {
            fontSize: '1.3rem',
            color: type === 'success' ? '#00f5d4' : '#7b2ff7',
        });
        
        const closeBtn = notification.querySelector('.notification-close');
        Object.assign(closeBtn.style, {
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '1.1rem',
            display: 'flex',
            flexShrink: '0',
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(-50%) translateY(0)';
        });
        
        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(-50%) translateY(100px)';
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }

    // ========================================
    // BACK TO TOP BUTTON
    // ========================================
    const backToTop = document.getElementById('backToTop');
    
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
        
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ========================================
    // TILT EFFECT (for project cards)
    // ========================================
    if (window.matchMedia('(hover: hover)').matches) {
        const tiltCards = document.querySelectorAll('.project-card, .code-window');
        
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -3;
                const rotateY = ((x - centerX) / centerX) * 3;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.transition = 'transform 0.5s ease';
                
                setTimeout(() => {
                    card.style.transition = '';
                }, 500);
            });
        });
    }

    // ========================================
    // MAGNETIC BUTTON EFFECT
    // ========================================
    if (window.matchMedia('(hover: hover)').matches) {
        const magneticBtns = document.querySelectorAll('.btn, .social-link');
        
        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    // ========================================
    // CODE WINDOW TYPING ANIMATION
    // ========================================
    const codeBody = document.querySelector('.code-body code');
    if (codeBody) {
        const originalHTML = codeBody.innerHTML;
        
        // We keep the code visible since it's already styled
        // This is just for a subtle initial reveal
        codeBody.style.opacity = '0';
        
        setTimeout(() => {
            codeBody.style.transition = 'opacity 1s ease';
            codeBody.style.opacity = '1';
        }, 1800);
    }

    // ========================================
    // PARALLAX ON MOUSE MOVE (Hero section)
    // ========================================
    if (window.matchMedia('(hover: hover)').matches) {
        const heroContent = document.querySelector('.hero-content');
        const heroVisual = document.querySelector('.hero-visual');
        
        if (heroContent && heroVisual) {
            document.addEventListener('mousemove', (e) => {
                const { clientX, clientY } = e;
                const { innerWidth, innerHeight } = window;
                
                const moveX = (clientX - innerWidth / 2) / innerWidth;
                const moveY = (clientY - innerHeight / 2) / innerHeight;
                
                heroContent.style.transform = `translate(${moveX * -10}px, ${moveY * -5}px)`;
                heroVisual.style.transform = `translate(${moveX * 15}px, ${moveY * 10}px)`;
            });
        }
    }

    // ========================================
    // CLOSE MOBILE NAV ON OUTSIDE CLICK
    // ========================================
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !navToggle.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // ========================================
    // KEYBOARD NAVIGATION
    // ========================================
    document.addEventListener('keydown', (e) => {
        // ESC key closes mobile nav
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // ========================================
    // CONSOLE EASTER EGG
    // ========================================
    console.log(
        '%c Hello there! 👋 %c\n' +
        '%c Interested in the code? Check out my GitHub! %c',
        'background: #00f5d4; color: #0a0a0f; font-size: 16px; font-weight: bold; padding: 8px 12px; border-radius: 4px;',
        '',
        'color: #7b2ff7; font-size: 13px; padding: 4px 0;',
        ''
    );
});
