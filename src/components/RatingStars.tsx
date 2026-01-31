import { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  totalRatings?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export function RatingStars({
  rating,
  totalRatings = 0,
  interactive = false,
  onRate,
  size = 'md',
  showCount = true,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          const isHalf = star - 0.5 <= displayRating && star > displayRating;

          return (
            <motion.button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRate?.(star)}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              whileHover={interactive ? { scale: 1.1 } : undefined}
              whileTap={interactive ? { scale: 0.95 } : undefined}
              className={cn(
                'transition-colors',
                interactive && 'cursor-pointer hover:text-amber-400',
                !interactive && 'cursor-default'
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled || isHalf
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-muted-foreground/30'
                )}
              />
            </motion.button>
          );
        })}
      </div>

      {showCount && totalRatings > 0 && (
        <span className="text-sm text-muted-foreground">
          ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
        </span>
      )}
    </div>
  );
}