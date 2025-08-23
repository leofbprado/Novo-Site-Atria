import { useEffect, useRef, useState } from "react";

export default function useOnVisible(options={ rootMargin: "200px" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (!ref.current || visible) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); io.disconnect(); }
    }, options);
    io.observe(ref.current);
    return () => io.disconnect();
  }, [visible]);
  
  return [ref, visible];
}