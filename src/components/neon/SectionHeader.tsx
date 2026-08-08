import clsx from 'clsx';

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  className?: string;
};

export default function SectionHeader({ eyebrow, title, className }: SectionHeaderProps) {
  return (
    <div className={clsx('flex items-center gap-4', className)}>
      <div className="relative flex items-center gap-3">
        {/* Glow bar */}
        <div className="w-1 h-7 rounded-full bg-[#00d4ff] shadow-[0_0_12px_#00D4FFCC]" />
        <div>
          {eyebrow && (
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#00D4FFB2] mb-0.5">
              {eyebrow}
            </p>
          )}
          <h2 className="font-black text-xl md:text-2xl text-[var(--system-color-mist-lavender)] tracking-tight">
            {title}
          </h2>
        </div>
      </div>
    </div>
  );
}
