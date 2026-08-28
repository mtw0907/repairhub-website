import type { ComponentPropsWithoutRef } from "react";
import Link from "next/link";

export type ButtonVariant = "primary" | "accent" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  accent: "bg-accent text-accent-foreground hover:bg-accent/90",
  outline:
    "border border-neutral-300 bg-white text-neutral-700 hover:border-accent/50 hover:text-accent dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300",
  ghost: "text-neutral-600 hover:bg-accent/10 hover:text-accent dark:text-neutral-300",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3.5 py-2 text-xs",
  md: "min-h-11 px-5 py-3 text-sm",
  lg: "min-h-11 px-7 py-3.5 text-base",
};

// 사이트 전역에서 반복되던 "rounded-xl ... hover:scale-[1.02]" 버튼 스타일을
// 표준화한 디자인 시스템 프리미티브. md/lg는 접근성 최소 터치 영역(44px)을
// 만족하도록 min-h-11을 강제한다.
export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className = "") {
  return `inline-flex items-center justify-center gap-1.5 rounded-xl font-bold shadow-sm transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentPropsWithoutRef<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentPropsWithoutRef<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
