import clsx from 'clsx';
import { HTMLAttributes, ReactNode } from 'react';

type NeonCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  glow?: 'cyan' | 'purple' | 'pink' | 'none';
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

const glowStyles = {
  cyan: 'border-neon-cyan/15 hover:border-neon-cyan/40 hover:shadow-[0_0_32px_#00D4FF1A]',
  purple: 'border-neon-purple/20 hover:border-neon-purple/50 hover:shadow-[0_0_32px_#7B2FBE1F]',
  pink: 'border-neon-pink/20 hover:border-neon-pink/45 hover:shadow-[0_0_32px_#FF2D781A]',
  none: 'border-text-primary/8',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6 md:p-8',
};

export default function NeonCard({
  children,
  glow = 'cyan',
  hoverable = false,
  padding = 'md',
  className,
  ...props
}: NeonCardProps) {
  return (
    <div
      className={clsx(
        'relative rounded-xl border backdrop-blur-xl overflow-hidden',
        'bg-bg-dark/60',
        glowStyles[glow],
        hoverable && 'transition-all duration-300 cursor-pointer',
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-xl bg-[linear-gradient(135deg,#00D4FF0A_0%,transparent_50%,#7B2FBE0A_100%)]"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
