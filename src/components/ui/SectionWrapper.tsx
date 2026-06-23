import Reveal from "@/components/motion/Reveal";

interface SectionWrapperProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}

export default function SectionWrapper({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
  innerClassName = "",
}: SectionWrapperProps) {
  return (
    <section id={id} className={`relative z-10 py-24 ${className}`}>
      <div className={`max-w-6xl mx-auto px-6 ${innerClassName}`}>
        {(eyebrow || title || subtitle) && (
          <Reveal className="mb-12 text-center">
            {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
            {title && (
              <h2 className="text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-text-muted text-lg max-w-2xl mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}
