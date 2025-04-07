import { useEffect, useRef } from 'react';

const MouseTrail = ({ excludeSelector }) => {
    const canvasRef = useRef(null);                 
    const particlesRef = useRef([]);                    
    const mouseRef = useRef({ x: 0, y: 0, isOnScreen: false }); // Mouse position and state
    const frameRef = useRef();                          

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Handles canvas resize to match window dimensions
        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        setCanvasSize();
        window.addEventListener('resize', setCanvasSize);

        // Particle class 
        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 10 + 3;      // Random size between 3 and 13
                this.speedX = Math.random() * 1.5 - 0.75; // Random horizontal speed
                this.speedY = Math.random() * 1.5 - 0.75; // Random vertical speed
                this.life = 1;                           // Full opacity to start
            }

            /**
             * Updates particle position, size, and life
             * Called each animation frame
             */
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.life -= 0.01;  // Gradually reduce opacity

                // Decrease size but keep it above 0
                this.size = Math.max(this.size - 0.05, 0);
            }

            /**
             * Renders particle on canvas
             * @param {CanvasRenderingContext2D} ctx - Canvas context
             */
            draw(ctx) {
                if (this.size <= 0) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${this.life * 0.5})`;
                ctx.fill();
            }
        }

        /**
         * Creates new particles at current mouse position
         * Called when mouse is moving and not over excluded area
         */
        const addParticles = () => {
            const { x, y } = mouseRef.current;
            for (let i = 0; i < 2; i++) {
                particlesRef.current.push(new Particle(x, y));
            }
        };

        /**
         * Mouse event handlers
         * Track mouse position and determine if it's over excluded area
         */
        const handleMouseMove = (e) => {
            const excludeElement = document.querySelector(excludeSelector);
            const isOverForm = excludeElement?.contains(e.target);
            
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;
            mouseRef.current.isOnScreen = !isOverForm;
        };

        const handleMouseEnter = () => {
            const excludeElement = document.querySelector(excludeSelector);
            const isOverForm = excludeElement?.contains(document.activeElement);
            mouseRef.current.isOnScreen = !isOverForm;
        };

        const handleMouseLeave = () => {
            mouseRef.current.isOnScreen = false;
        };

        // Main animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (mouseRef.current.isOnScreen) {
                addParticles();
            }

            particlesRef.current = particlesRef.current.filter(p => {
                p.update();
                p.draw(ctx);
                return p.life > 0 && p.size > 0;
            });

            frameRef.current = requestAnimationFrame(animate);
        };

        // Event listeners setup
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseenter', handleMouseEnter);
        document.addEventListener('mouseleave', handleMouseLeave);
        animate();

        // Cleanup function
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseenter', handleMouseEnter);
            document.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('resize', setCanvasSize);
            cancelAnimationFrame(frameRef.current);
        };
    }, [excludeSelector]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50"
            style={{ background: 'transparent' }}
        />
    );
};

export default MouseTrail;
