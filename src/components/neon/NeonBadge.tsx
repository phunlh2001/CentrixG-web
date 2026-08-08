import clsx from 'clsx';
import { HTMLAttributes, ReactNode } from 'react';

type NeonBadgeColor = 'cyan' | 'purple' | 'pink' | 'green' | 'amber';

type NeonBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  color?: NeonBadgeColor;
  dot?: boolean;
};

const colorStyles: Record<NeonBadgeColor, string> = {
  cyan: 'bg-[#00D4FF1F] border-[#00D4FF4C] text-[#00d4ff]',
  purple: 'bg-[#7B2FBE26] border-[#7B2FBE66] text-[#c084fc]',
  pink: 'bg-[#FF2D781F] border-[#FF2D784C] text-[#ff2d78]',
  green: 'bg-[#00FF881F] border-[#00FF884C] text-[#00ff88]',
  amber: 'bg-[#FFB0001F] border-[#FFB0004C] text-[#ffb000]',
};

const dotColors: Record<NeonBadgeColor, string> = {
  cyan: 'bg-[#00d4ff] shadow-[0_0_6px_#00d4ff]',
  purple: 'bg-[#c084fc] shadow-[0_0_6px_#c084fc]',
  pink: 'bg-[#ff2d78] shadow-[0_0_6px_#ff2d78]',
  green: 'bg-[#00ff88] shadow-[0_0_6px_#00ff88]',
  amber: 'bg-[#ffb000] shadow-[0_0_6px_#ffb000]',
};

export default function NeonBadge({ children, color = 'cyan', dot, className, ...props }: NeonBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold border tracking-wide',
        colorStyles[color],
        className
      )}
      {...props}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dotColors[color])} />}
      {children}
    </span>
  );
}
