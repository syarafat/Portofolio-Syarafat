/* ============================================
   SCROLL ANIMATIONS (Custom AOS replacement)
   Lightweight Animate On Scroll
   ============================================ */

class ScrollAnimator {
    constructor() {
        this.elements = [];
        this.observer = null;
        this.init();
    }
    
    init() {
        // Collect all elements with data-aos attribute
        this.elements = document.querySelectorAll('[data-aos]');
        
        if (!this.elements.length) return;
        
        // Create Intersection Observer
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.getAttribute('data-aos-delay') || 0;
                    
                    setTimeout(() => {
                        entry.target.classList.add('aos-animate');
                    }, parseInt(delay));
                    
                    // Unobserve after animation (one-time trigger)
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe all elements
        this.elements.forEach(el => {
            this.observer.observe(el);
        });
    }
    
    // Refresh observer (for dynamically added elements)
    refresh() {
        const newElements = document.querySelectorAll('[data-aos]:not(.aos-animate)');
        newElements.forEach(el => {
            this.observer.observe(el);
        });
    }
}

/* ============================================
   SKILL BAR ANIMATION
   ============================================ */
class SkillBarAnimator {
    constructor() {
        this.bars = document.querySelectorAll('.skill-bar');
        this.init();
    }
    
    init() {
        if (!this.bars.length) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const level = bar.getAttribute('data-level');
                    
                    setTimeout(() => {
                        bar.style.width = level + '%';
                        bar.classList.add('animated');
                    }, 200);
                    
                    observer.unobserve(bar);
                }
            });
        }, {
            threshold: 0.5
        });
        
        this.bars.forEach(bar => observer.observe(bar));
    }
}

/* ============================================
   COUNTER ANIMATION
   ============================================ */
class CounterAnimator {
    constructor() {
        this.counters = document.querySelectorAll('[data-count]');
        this.init();
    }
    
    init() {
        if (!this.counters.length) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });
        
        this.counters.forEach(counter => observer.observe(counter));
    }
    
    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000;
        const start = 0;
        const startTime = performance.now();
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out cubic)
            const eased = 1 - Math.pow(1 - progress, 3);
            
            const current = Math.round(start + (target - start) * eased);
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };
        
        requestAnimationFrame(updateCounter);
    }
}

// Initialize all scroll animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ScrollAnimator();
    new SkillBarAnimator();
    new CounterAnimator();
});
