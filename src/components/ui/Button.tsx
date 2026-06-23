import Link from "next/link";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

type Variant = "primary" | "outline" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: [
    "bg-frost text-bg-base font-semibold",
    "hover:bg-frost-cyan hover:-translate-y-0.5",
    "hover:shadow-[0_6px_24px_rgba(136,192,208,0.35)]",
    "active:translate-y-0",
  ].join(" "),
  outline: "border border-frost/40 text-frost hover:bg-frost/10 hover:border-frost",
  ghost: "text-text-secondary hover:text-frost hover:bg-bg-elevated",
};

const base =
  "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium " +
  "transition-all duration-200 focus-visible:outline focus-visible:outline-2 " +
  "focus-visible:outline-frost focus-visible:outline-offset-2 select-none";

// ── Native button ──────────────────────────────────────────────────────────────

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  as?: "button";
  variant?: Variant;
  shimmer?: boolean;
}

// ── Internal Next.js link ──────────────────────────────────────────────────────

interface LinkButtonProps extends ComponentPropsWithoutRef<typeof Link> {
  as: "link";
  href: string;
  variant?: Variant;
  shimmer?: boolean;
}

// ── External anchor ────────────────────────────────────────────────────────────

interface AnchorButtonProps extends ComponentPropsWithoutRef<"a"> {
  as: "a";
  href: string;
  variant?: Variant;
  shimmer?: boolean;
}

type AllButtonProps = ButtonProps | LinkButtonProps | AnchorButtonProps;

function cls(variant: Variant, shimmer?: boolean, extra?: string) {
  return [base, variantClasses[variant], shimmer ? "shimmer-btn" : "", extra ?? ""]
    .filter(Boolean)
    .join(" ");
}

const Button = forwardRef<HTMLButtonElement, AllButtonProps>(function Button(props, ref) {
  if (props.as === "link") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { as: _, variant = "primary", shimmer, className, ...rest } = props as LinkButtonProps;
    return <Link className={cls(variant, shimmer, className)} {...rest} />;
  }

  if (props.as === "a") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { as: _, variant = "primary", shimmer, className, ...rest } = props as AnchorButtonProps;
    return (
      <a
        className={cls(variant, shimmer, className)}
        rel="noopener noreferrer"
        target="_blank"
        {...rest}
      />
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { as: _, variant = "primary", shimmer, className, ...rest } = props as ButtonProps;
  return <button ref={ref} className={cls(variant, shimmer, className)} {...rest} />;
});

export default Button;
