import { useEffect, useState } from 'react';

const MouseTrail2 = ({ excludeSelector }) => {
  const [dots, setDots] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hue, setHue] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Check if the mouse is over excluded elements
      if (excludeSelector) {
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (element && element.closest(excludeSelector)) {
          return;
        }
      }

      setMousePosition({ x: e.clientX, y: e.clientY });
      setHue(prev => (prev + 2) % 360); // Rotate through colors

      setDots(prevDots => {
        const newDot = {
          x: e.clientX,
          y: e.clientY,
          opacity: 1,
          scale: 1,
          hue: hue,
          id: Date.now()
        };

        // Keep only the last 20 dots for a longer trail
        const updatedDots = [...prevDots, newDot].slice(-20);
        return updatedDots;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animationInterval = setInterval(() => {
      setDots(prevDots =>
        prevDots
          .map(dot => ({
            ...dot,
            opacity: dot.opacity - 0.05, // Slower fade for longer trail
            scale: dot.scale - 0.03 // Slower shrink
          }))
          .filter(dot => dot.opacity > 0)
      );
    }, 50);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(animationInterval);
    };
  }, [excludeSelector, hue]);

  // Fun, vibrant colors for children
  const funColors = [
    'hsl(350, 100%, 66%)',  // Bright Pink
    'hsl(280, 100%, 65%)',  // Purple
    'hsl(190, 100%, 50%)',  // Cyan
    'hsl(130, 90%, 50%)',   // Lime Green
    'hsl(40, 100%, 60%)',   // Orange
    'hsl(60, 100%, 60%)',   // Yellow
    'hsl(330, 100%, 65%)',  // Hot Pink
    'hsl(210, 100%, 60%)'   // Sky Blue
  ];

  return (
    <div style={{ pointerEvents: 'none', position: 'fixed', inset: 0, zIndex: 9999 }}>
      {/* Main cursor dot */}
      <div
        style={{
          position: 'fixed',
          left: mousePosition.x,
          top: mousePosition.y,
          width: '15px',
          height: '15px',
          background: `hsl(${hue}, 100%, 65%)`,
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(2px) brightness(1.2)',
          boxShadow: `0 0 10px hsl(${hue}, 100%, 70%)`,
          transition: 'transform 0.15s ease-out',
        }}
      />

      {/* Trail dots */}
      {dots.map((dot, index) => {
        const color = funColors[index % funColors.length];
        const size = 12 - (index * 0.4); // Gradually decrease size

        return (
          <div
            key={dot.id}
            style={{
              position: 'fixed',
              left: dot.x,
              top: dot.y,
              width: `${size}px`,
              height: `${size}px`,
              background: color,
              borderRadius: '50%',
              transform: `translate(-50%, -50%) scale(${dot.scale})`,
              opacity: dot.opacity,
              filter: 'blur(3px) brightness(1.2)',
              boxShadow: `0 0 8px ${color}`,
              transition: 'transform 0.3s ease-out',
            }}
          />
        );
      })}

      {/* Enhanced glow effect */}
      <div
        style={{
          position: 'fixed',
          left: mousePosition.x,
          top: mousePosition.y,
          width: '40px',
          height: '40px',
          background: `radial-gradient(circle, hsla(${hue}, 100%, 70%, 0.4) 0%, transparent 70%)`,
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(2px)',
          pointerEvents: 'none',
        }}
      />

      {/* Sparkle effect */}
      <div
        style={{
          position: 'fixed',
          left: mousePosition.x,
          top: mousePosition.y,
          width: '20px',
          height: '20px',
          background: 'white',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%) scale(0.3)',
          opacity: 0.6,
          filter: 'blur(1px)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default MouseTrail2; 