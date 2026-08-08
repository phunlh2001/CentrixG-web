'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

type BaseRatingProps = {
  value?: number; // Giá trị rating hiện tại (0 - 5)
  onSelect?: (value: number) => void; // Callback khi người dùng chọn rating
  readonly?: boolean; // Chỉ xem, không cho tương tác
};

export default function BaseRating({
  value = 0,
  onSelect,
  readonly = false,
}: BaseRatingProps) {
  const maxStars = 5;
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue !== null ? hoverValue : value;

  const handleMouseEnter = (starIndex: number) => {
    if (!readonly) setHoverValue(starIndex);
  };

  const handleMouseLeave = () => {
    if (!readonly) setHoverValue(null);
  };

  const handleClick = (starIndex: number) => {
    if (!readonly && onSelect) {
      onSelect(starIndex);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxStars)].map((_, index) => {
        const starIndex = index + 1;
        const isFilled = starIndex <= Math.round(displayValue);

        return (
          <div
            key={index}
            className={`transition-all duration-200 select-none ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            }`}
            onMouseEnter={() => handleMouseEnter(starIndex)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(starIndex)}
          >
            <Star
              className={`w-6 h-6 ${
                isFilled
                  ? 'fill-amber-500 text-amber-500'
                  : 'text-gray-600 hover:text-amber-400'
              }`}
            />
          </div>
        );
      })}

      {value > 0 && (
        <span className="ml-3 font-medium text-zinc-400 text-sm">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
