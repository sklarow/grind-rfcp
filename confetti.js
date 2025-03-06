class Confetti {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'];
        
        this.setupCanvas();
        this.animate = this.animate.bind(this);
    }

    setupCanvas() {
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        document.body.appendChild(this.canvas);
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle(x, y) {
        return {
            x,
            y,
            size: Math.random() * 10 + 5,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            speedX: Math.random() * 6 - 3,
            speedY: Math.random() * -3 - 3,
            gravity: 0.1,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5
        };
    }

    burst(x, y) {
        for (let i = 0; i < 50; i++) {
            this.particles.push(this.createParticle(x, y));
        }
        
        if (!this.animationFrame) {
            this.animate();
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.speedY += particle.gravity;
            particle.rotation += particle.rotationSpeed;
            
            this.ctx.save();
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate((particle.rotation * Math.PI) / 180);
            
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
            
            this.ctx.restore();
            
            if (particle.y > this.canvas.height || particle.x < 0 || particle.x > this.canvas.width) {
                this.particles.splice(i, 1);
            }
        }
        
        if (this.particles.length > 0) {
            this.animationFrame = requestAnimationFrame(this.animate);
        } else {
            this.animationFrame = null;
        }
    }
}

// Initialize confetti instance
const confetti = new Confetti();

// Export for use in other files
window.confetti = confetti;