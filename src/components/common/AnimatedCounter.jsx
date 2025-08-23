import React, { useEffect, useRef, useState } from "react";

const AnimatedCounter = ({ max, prefix = "", suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true);
            
            // Start animation
            const duration = 2000; // 2 seconds
            const frameRate = 60; // 60 fps
            const totalFrames = duration / (1000 / frameRate);
            const increment = max / totalFrames;
            
            let currentCount = 0;
            const timer = setInterval(() => {
              currentCount += increment;
              if (currentCount >= max) {
                setCount(max);
                clearInterval(timer);
              } else {
                setCount(Math.floor(currentCount));
              }
            }, 1000 / frameRate);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    
    return () => observer.disconnect();
  }, [max, hasStarted]);

  return (
    <span ref={elementRef}>
      {prefix}{count}{suffix}
    </span>
  );
};

export default AnimatedCounter;