// components/AnimatedBackground.tsx
import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// --- SVG Icons ---
const LeafIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17,8C8,10,5.9,16.17,3.82,21.34L5.71,22l1-2.3A4.49,4.49,0,0,0,8,20.84C8.63,20.25,12.45,18.14,15.61,16a5,5,0,0,0,2.57-3.23C18.68,10.61,18.5,8.8,17,8Z" />
  </svg>
);

const BubbleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      opacity="0.6"
    />
    <path
      d="M14 8c1.5 0 3 1.5 3 3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

// --- Random Utility ---
const random = (min: number, max: number) => Math.random() * (max - min) + min;

export const AnimatedBackground = () => {
  // We use state to ensure hydration matches (Next.js/React strict mode safety)
  const [bubbles, setBubbles] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);

  useEffect(() => {
    // Generate random particles only on client-side
    const b = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      x: random(0, 100),
      scale: random(0.5, 1.5),
      duration: random(15, 25),
      delay: random(0, 10),
    }));

    const l = Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      x: random(0, 100),
      rotate: random(0, 360),
      duration: random(20, 30),
      delay: random(0, 15),
    }));

    setBubbles(b);
    setLeaves(l);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* SOAP BUBBLES (Floating Up) */}
      {bubbles.map((b) => (
        <motion.div
          key={`bubble-${b.id}`}
          className="absolute text-blue-100/30"
          style={{
            left: `${b.x}%`,
            bottom: "-50px",
          }}
          animate={{
            y: [0, -1200],
            x: [0, random(-50, 50)], // Slight wobble
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            ease: "linear",
            delay: b.delay,
          }}
        >
          <BubbleIcon className="w-8 h-8 md:w-12 md:h-12" />
        </motion.div>
      ))}

      {/* LEAVES (Drifting Down) */}
      {leaves.map((l) => (
        <motion.div
          key={`leaf-${l.id}`}
          className="absolute text-[#8a9a5b]/20"
          style={{
            left: `${l.x}%`,
            top: "-50px",
          }}
          animate={{
            y: [0, 1200],
            x: [0, random(-100, 100)], // Drifting in wind
            rotate: [l.rotate, l.rotate + 360],
          }}
          transition={{
            duration: l.duration,
            repeat: Infinity,
            ease: "linear",
            delay: l.delay,
          }}
        >
          <LeafIcon className="w-6 h-6 md:w-10 md:h-10" />
        </motion.div>
      ))}
    </div>
  );
};

// --- Reveal on Scroll Wrapper ---
export const Reveal = ({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
