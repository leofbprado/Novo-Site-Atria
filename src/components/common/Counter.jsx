import React, { useEffect, useRef, useState } from "react";

const Counter = ({ parentClass, min = 0, max }) => {
  const targetElement = useRef();
  const [counted, setCounted] = useState(min);

  const startCountup = () => {
    setCounted(min); // Reset to start
    const duration = 2000; // 2 seconds
    const steps = 60; // 60 steps
    const increment = max / steps;
    let step = 0;
    
    const intervalId = setInterval(() => {
      step++;
      if (step >= steps) {
        setCounted(max);
        clearInterval(intervalId);
      } else {
        setCounted(Math.floor(increment * step));
      }
    }, duration / steps);
  };

  useEffect(() => {
    // Reset count when max changes
    setCounted(min);
    
    const handleIntersection = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startCountup();
          observer.unobserve(entry.target);
        }
      });
    };

    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.3,
    };

    const observer = new IntersectionObserver(handleIntersection, options);
    if (targetElement.current) {
      observer.observe(targetElement.current);
    }

    return () => {
      if (targetElement.current) {
        observer.unobserve(targetElement.current);
      }
    };
  }, [max]);

  return (
    <span ref={targetElement} className={parentClass}>
      {counted}
    </span>
  );
};

export default Counter;
