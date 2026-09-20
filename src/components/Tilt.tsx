"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";

export default function Tilt({
  children,
  className = "",
  maxRotation = 12,
}: {
  children: ReactNode;
  className?: string;
  maxRotation?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<Record<string, string>>({});

  return (
    <div
      ref={ref}
      className={`tilt-wrapper ${className}`}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setStyle({
          "--rx": `${-(y / rect.height - 0.5) * maxRotation}deg`,
          "--ry": `${(x / rect.width - 0.5) * maxRotation}deg`,
          "--mx": `${(x / rect.width) * 100}%`,
          "--my": `${(y / rect.height) * 100}%`,
          "--go": "1",
        });
      }}
      onMouseLeave={() => setStyle({ "--rx": "0deg", "--ry": "0deg", "--go": "0" })}
      style={style as CSSProperties}
    >
      <div className="tilt-card">
        <div className="tilt-glare" />
        {children}
      </div>
    </div>
  );
}
