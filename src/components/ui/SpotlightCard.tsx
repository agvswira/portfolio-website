"use client";

import { useRef, type ComponentPropsWithoutRef, type ElementType } from "react";

type SpotlightCardProps<T extends ElementType = "div"> = {
  as?: T;
  beam?: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export default function SpotlightCard<T extends ElementType = "div">({
  as,
  beam = false,
  className = "",
  children,
  ...rest
}: SpotlightCardProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  const cardRef = useRef<HTMLElement>(null);

  // Track cursor position for spotlight glow — writes CSS vars directly (no re-render)
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
  };

  const handleMouseLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");
  };

  return (
    <Tag
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`hud-card spotlight-card ${beam ? "border-beam" : ""} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
