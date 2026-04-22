/* ============================================
   PARTICLE SYSTEM
   Interactive particle network background
   ============================================ */

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.animationId = null;
        this.isRunning = false;
        
        // Configuration
        this.config = {
            particleCount: 80,
            particleMinSize: 1,
            particleMaxSize: 2.5,
            particleSpeed: 0.3,
            connectionDistance: 150,
            mouseRepelDistance: 120,
            colors: [
                'rgba(0, 245, 212, ',
                'rgba(123, 47, 247, ',
                'rgba(0, 187, 249, ',
            ]
        };
        
        this.init();
    }
    
    init() {
        this.resize();
        this.createParticles();
        this.setupEventListeners();
        this.start();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        this.particles = [];
        
        // Adjust particle count based on screen size
        const area = this.canvas.width * this.canvas.height;
        const count = Math.min(this.config.particleCount, Math.floor(area / 15000));
        
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(this));
        }
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
        });
        
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
        
        // Reduce animation when tab is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stop();
            } else {
                this.start();
            }
        });
    }
    
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.config.connectionDistance) {
                    const opacity = (1 - distance / this.config.connectionDistance) * 0.15;
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(0, 245, 212, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
            
            // Draw connection to mouse
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = this.particles[i].x - this.mouse.x;
                const dy = this.particles[i].y - this.mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.mouse.radius) {
                    const opacity = (1 - distance / this.mouse.radius) * 0.3;
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(0, 245, 212, ${opacity})`;
                    this.ctx.lineWidth = 0.8;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.mouse.x, this.mouse.y);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        this.drawConnections();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }
    
    stop() {
        if (this.isRunning) {
            this.isRunning = false;
            cancelAnimationFrame(this.animationId);
        }
    }
}

class Particle {
    constructor(system) {
        this.system = system;
        this.canvas = system.canvas;
        this.ctx = system.ctx;
        
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        this.size = Math.random() * (system.config.particleMaxSize - system.config.particleMinSize) + system.config.particleMinSize;
        
        this.speedX = (Math.random() - 0.5) * system.config.particleSpeed;
        this.speedY = (Math.random() - 0.5) * system.config.particleSpeed;
        
        this.color = system.config.colors[Math.floor(Math.random() * system.config.colors.length)];
        this.opacity = Math.random() * 0.5 + 0.2;
        this.opacityDirection = Math.random() > 0.5 ? 1 : -1;
    }
    
    update() {
        // Move
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Wrap around edges
        if (this.x < -10) this.x = this.canvas.width + 10;
        if (this.x > this.canvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = this.canvas.height + 10;
        if (this.y > this.canvas.height + 10) this.y = -10;
        
        // Mouse interaction - gentle repel
        if (this.system.mouse.x !== null && this.system.mouse.y !== null) {
            const dx = this.x - this.system.mouse.x;
            const dy = this.y - this.system.mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.system.config.mouseRepelDistance) {
                const force = (this.system.config.mouseRepelDistance - distance) / this.system.config.mouseRepelDistance;
                this.x += (dx / distance) * force * 1.5;
                this.y += (dy / distance) * force * 1.5;
            }
        }
        
        // Twinkle effect
        this.opacity += this.opacityDirection * 0.003;
        if (this.opacity >= 0.7 || this.opacity <= 0.1) {
            this.opacityDirection *= -1;
        }
    }
    
    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color + this.opacity + ')';
        this.ctx.fill();
        
        // Glow effect for larger particles
        if (this.size > 1.5) {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
            this.ctx.fillStyle = this.color + (this.opacity * 0.1) + ')';
            this.ctx.fill();
        }
    }
}

// Initialize particle system
const particleSystem = new ParticleSystem('particleCanvas');
