import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion";

// ── Media query hook ─────────────────────────────────────────────────────────
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function useMediaQuery(
  query: string,
  { defaultValue = false } = {}
): boolean {
  const getMatches = (q: string) =>
    typeof window !== "undefined" ? window.matchMedia(q).matches : defaultValue;
  const [matches, setMatches] = useState(() => getMatches(query));
  useIsomorphicLayoutEffect(() => {
    const mq = window.matchMedia(query);
    const handler = () => setMatches(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

// ── Types ────────────────────────────────────────────────────────────────────
export interface CarouselCard {
  brand: string;
  count: number;
  svg: JSX.Element;
  label?: string;
}

// ── Carousel ─────────────────────────────────────────────────────────────────
const Carousel = memo(function Carousel({
  handleClick,
  cards,
}: {
  handleClick: (brand: string, index: number) => void;
  cards: CarouselCard[];
}) {
  const controls = useAnimation();
  const isScreenSizeSm = useMediaQuery("(max-width: 640px)");
  const isScreenSizeMd = useMediaQuery("(max-width: 768px)");

  // Each card gets a minimum face width; cylinder scales with card count
  const faceWidth = isScreenSizeSm ? 90 : isScreenSizeMd ? 120 : 140;
  const faceCount = cards.length;
  const cylinderWidth = faceWidth * faceCount;
  const radius = cylinderWidth / (2 * Math.PI);

  const rotation = useMotionValue(0);
  const transform = useTransform(
    rotation,
    (value) => `rotate3d(0, 1, 0, ${value}deg)`
  );

  const isDragging = useRef(false);
  const autoRef = useRef<number>(0);

  // Auto-rotate
  useEffect(() => {
    const step = () => {
      if (!isDragging.current) {
        rotation.set(rotation.get() - 0.12);
      }
      autoRef.current = requestAnimationFrame(step);
    };
    autoRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(autoRef.current);
  }, [rotation]);

  return (
    <div
      className="flex h-full items-center justify-center"
      style={{
        perspective: isScreenSizeSm ? "500px" : "1000px",
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0}
        className="relative flex h-full origin-center cursor-grab justify-center active:cursor-grabbing"
        style={{
          transform,
          rotateY: rotation,
          width: cylinderWidth,
          transformStyle: "preserve-3d",
        }}
        onDragStart={() => {
          isDragging.current = true;
        }}
        onDrag={(_, info) => {
          rotation.set(rotation.get() + info.offset.x * 0.05);
        }}
        onDragEnd={(_, info) => {
          isDragging.current = false;
          controls.start({
            rotateY: rotation.get() + info.velocity.x * 0.05,
            transition: {
              type: "spring",
              stiffness: 100,
              damping: 30,
              mass: 0.1,
            },
          });
        }}
        animate={controls}
      >
        {cards.map((card, i) => (
          <motion.div
            key={card.brand}
            className="absolute flex h-full origin-center items-center justify-center"
            style={{
              width: `${faceWidth}px`,
              transform: `rotateY(${i * (360 / faceCount)}deg) translateZ(${radius}px)`,
            }}
            onClick={() => handleClick(card.brand, i)}
          >
            <div className="pointer-events-none rounded-xl bg-white shadow-lg flex flex-col items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 w-[76px] h-[76px] sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px]">
              <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center">
                {card.svg}
              </div>
              <span className="font-barlow-condensed font-bold text-[9px] sm:text-xs md:text-sm text-gray-800 leading-tight text-center truncate w-full">
                {card.label ?? card.brand}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
});

export default Carousel;
export { Carousel };
