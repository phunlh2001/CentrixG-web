import clsx from "clsx";
import { ButtonHTMLAttributes, ReactNode } from "react";
import BaseButton from "../ui/BaseButton";

type NeonButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "outline";
type NeonButtonSize = "sm" | "md" | "lg";

type NeonButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: NeonButtonVariant;
  size?: NeonButtonSize;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
};

const variantStyles: Record<NeonButtonVariant, string> = {
  primary:
    "bg-neon-cyan/12 hover:bg-neon-cyan/20 border border-neon-cyan/35 hover:border-neon-cyan/65 text-neon-cyan hover:shadow-[0_0_20px_#00D4FF4D] active:scale-[0.98]",
  secondary:
    "bg-neon-purple/20 hover:bg-neon-purple/30 border border-neon-purple/40 hover:border-neon-purple/70 text-neon-lavender hover:shadow-[0_0_20px_#7B2FBE59] active:scale-[0.98]",
  ghost:
    "bg-transparent hover:bg-text-primary/6 border border-text-primary/12 hover:border-text-primary/25 text-text-primary/70 hover:text-text-primary/90 active:scale-[0.98]",
  danger:
    "bg-neon-pink/12 hover:bg-neon-pink/20 border border-neon-pink/35 hover:border-neon-pink/60 text-neon-pink hover:shadow-[0_0_20px_#FF2D784D] active:scale-[0.98]",
  outline:
    "bg-transparent hover:bg-neon-cyan/6 border border-neon-cyan/20 hover:border-neon-cyan/45 text-text-primary hover:text-neon-cyan active:scale-[0.98]",
};

const sizeStyles: Record<NeonButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2.5",
};

export default function NeonButton({
  variant = "primary",
  size = "md",
  startIcon,
  endIcon,
  fullWidth,
  className,
  children,
  disabled,
  ...props
}: NeonButtonProps) {
  return (
    <BaseButton
      variant="custom"
      disabled={disabled}
      className={clsx(
        "inline-flex justify-center items-center backdrop-blur-sm rounded-lg font-semibold transition-all duration-200 cursor-pointer select-none",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        disabled && "opacity-40 cursor-not-allowed pointer-events-none",
        className,
      )}
      {...props}
    >
      {startIcon && <span className="shrink-0">{startIcon}</span>}
      {children}
      {endIcon && <span className="shrink-0">{endIcon}</span>}
    </BaseButton>
  );
}
