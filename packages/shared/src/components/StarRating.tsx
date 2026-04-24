import { useState } from 'react';

interface Props {
  value: number;
  max?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'text-sm', md: 'text-lg', lg: 'text-3xl' };

export const StarRating = ({ value, max = 5, interactive = false, onChange, size = 'md' }: Props) => {
  const [hover, setHover] = useState<number | null>(null);
  const current = hover ?? value;
  return (
    <div className={`inline-flex ${sizes[size]}`} role={interactive ? 'radiogroup' : 'img'} aria-label={`${value} of ${max}`}>
      {Array.from({ length: max }).map((_, i) => {
        const n = i + 1;
        const filled = n <= current;
        return (
          <button
            type="button"
            key={n}
            disabled={!interactive}
            onMouseEnter={() => interactive && setHover(n)}
            onMouseLeave={() => interactive && setHover(null)}
            onClick={() => interactive && onChange?.(n)}
            className={`${interactive ? 'cursor-pointer' : 'cursor-default'} px-0.5 leading-none ${filled ? 'text-amber-400' : 'text-gray-300'}`}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
};
