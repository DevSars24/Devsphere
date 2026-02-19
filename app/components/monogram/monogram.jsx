import { forwardRef, useId } from 'react';
import { classes } from '~/utils/style';
import styles from './monogram.module.css';

/**
 * SARS monogram — a geometric "S" inside a thin ring.
 * Inspired by Tony Stark's precision + Steve Jobs' minimalism.
 */
export const Monogram = forwardRef(({ highlight, className, ...props }, ref) => {
  const id = useId();
  const clipId = `${id}monogram-clip`;

  return (
    <svg
      aria-hidden
      className={classes(styles.monogram, className)}
      width="40"
      height="40"
      viewBox="0 0 40 40"
      ref={ref}
      {...props}
    >
      <defs>
        {/* Clip to the S shape + ring so the highlight animation is masked */}
        <clipPath id={clipId}>
          {/* Outer ring */}
          <path
            fillRule="evenodd"
            d="
              M20 1
              C9.5 1 1 9.5 1 20
              C1 30.5 9.5 39 20 39
              C30.5 39 39 30.5 39 20
              C39 9.5 30.5 1 20 1Z
              M20 3
              C29.4 3 37 10.6 37 20
              C37 29.4 29.4 37 20 37
              C10.6 37 3 29.4 3 20
              C3 10.6 10.6 3 20 3Z
            "
          />
          {/* Geometric S letterform */}
          <path
            d="
              M25.5 11.5
              C25.5 11.5 29 11.5 29 15.5
              C29 19.5 25 19.5 20 19.5
              C15 19.5 11 20 11 24
              C11 28 14.5 29.5 20 29.5
              C25.5 29.5 28.5 27 28.5 27
              L26.5 24.5
              C26.5 24.5 24 26.5 20 26.5
              C16 26.5 14 25 14 24
              C14 23 15 22.5 20 22.5
              C25 22.5 32 21.5 32 15.5
              C32 9.5 26 8.5 20.5 8.5
              C15 8.5 11 11 11 11
              L13 13.5
              C13 13.5 16 11.5 20.5 11.5
              Z
            "
          />
        </clipPath>
      </defs>

      {/* Base fill (uses currentColor = white/black based on theme) */}
      <rect clipPath={`url(#${clipId})`} width="100%" height="100%" />

      {/* Hover highlight layer */}
      {highlight && (
        <g clipPath={`url(#${clipId})`}>
          <rect className={styles.highlight} width="100%" height="100%" />
        </g>
      )}
    </svg>
  );
});
