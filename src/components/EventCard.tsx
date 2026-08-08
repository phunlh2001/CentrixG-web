import { ArrowRight, Clock } from 'lucide-react';
import { EventItem } from '@centrixg/shared';

type EventCardProps = {
  event: EventItem;
};

export default function EventCard({ event }: EventCardProps) {
  return (
    <article className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-neon-cyan/10 bg-[#08081CB2] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-neon-cyan/30 hover:shadow-[0_0_28px_#00D4FF14,0_8px_32px_#00000066]">
      <div className="relative aspect-video w-full overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.imageAlt || event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,#050510E6_0%,#0505104C_50%,transparent_80%)]" />

        {event.badge && (
          <span className="absolute top-3 left-3 rounded-md border border-neon-cyan/40 bg-neon-cyan/15 px-2 py-0.5 text-[10px] font-black tracking-widest text-neon-cyan uppercase shadow-[0_0_8px_#00D4FF40]">
            {event.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-3 text-[11px] font-semibold tracking-wider uppercase">
          <span className="text-neon-cyan">{event.category}</span>
          <span className="text-text-primary/20">·</span>
          <span className="text-text-primary/45">{event.date}</span>
          {event.readingTime && (
            <>
              <span className="text-text-primary/20">·</span>
              <span className="flex items-center gap-1 text-text-primary/45">
                <Clock size={10} />
                {event.readingTime}
              </span>
            </>
          )}
        </div>

        <h2 className="line-clamp-2 text-lg leading-snug font-extrabold tracking-tight text-text-primary transition-colors duration-200">
          {event.title}
        </h2>

        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-text-muted">
          {event.description}
        </p>

        <div className="flex items-center gap-1.5 pt-1 text-xs font-semibold text-neon-cyan/60 transition-all duration-200 group-hover:gap-2.5 group-hover:text-neon-cyan">
          Read more
          <ArrowRight
            size={12}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </div>
      </div>
    </article>
  );
}
