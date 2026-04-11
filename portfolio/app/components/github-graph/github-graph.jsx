import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import styles from './github-graph.module.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Fetches and renders a GitHub-style contribution heatmap with animated cells.
 * @param {{ username: string, className?: string }} props
 */
export function GitHubGraph({ username, className }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
  const gridRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchContributions() {
      try {
        const response = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${username}?y=last`
        );
        const json = await response.json();
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    fetchContributions();
    return () => { cancelled = true; };
  }, [username]);

  // Organize contributions into weeks (columns)
  const weeks = useMemo(() => {
    if (!data?.contributions) return [];
    const result = [];
    let currentWeek = [];
    data.contributions.forEach((day, i) => {
      const dayOfWeek = new Date(day.date).getDay();
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        result.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    });
    if (currentWeek.length > 0) result.push(currentWeek);
    return result;
  }, [data]);

  // Extract month labels
  const monthLabels = useMemo(() => {
    if (!data?.contributions) return [];
    const labels = [];
    let lastMonth = -1;
    data.contributions.forEach((day) => {
      const month = new Date(day.date).getMonth();
      if (month !== lastMonth) {
        labels.push(MONTHS[month]);
        lastMonth = month;
      }
    });
    return labels;
  }, [data]);

  const handleCellHover = useCallback((e, day) => {
    const rect = e.target.getBoundingClientRect();
    const dateStr = new Date(day.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    setTooltip({
      show: true,
      text: `${day.count} contribution${day.count !== 1 ? 's' : ''} on ${dateStr}`,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  }, []);

  const handleCellLeave = useCallback(() => {
    setTooltip((prev) => ({ ...prev, show: false }));
  }, []);

  // Auto-scroll to the end (most recent) on mount
  useEffect(() => {
    if (gridRef.current && !loading) {
      gridRef.current.scrollLeft = gridRef.current.scrollWidth;
    }
  }, [loading]);

  if (loading) {
    return (
      <div className={`${styles.graph} ${className || ''}`}>
        <div className={styles.loading}>
          <span className={styles.loadingDots}>Loading contributions</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={`${styles.graph} ${className || ''}`}>
      <div className={styles.header}>
        <span className={styles.title}>Contributions</span>
        <span className={styles.totalCount}>
          {data.total?.lastYear?.toLocaleString() || 0} in the last year
        </span>
      </div>

      <div className={styles.grid} ref={gridRef}>
        {weeks.map((week, wi) => (
          <div className={styles.week} key={wi}>
            {week.map((day) => (
              <div
                key={day.date}
                className={styles.cell}
                data-level={day.level}
                style={{ animationDelay: `${wi * 8}ms` }}
                onMouseEnter={(e) => handleCellHover(e, day)}
                onMouseLeave={handleCellLeave}
                aria-label={`${day.count} contributions on ${day.date}`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className={styles.months}>
        {monthLabels.map((m, i) => (
          <span className={styles.monthLabel} key={`${m}-${i}`}>{m}</span>
        ))}
      </div>

      {/* Floating tooltip */}
      <div
        className={styles.tooltip}
        data-show={tooltip.show}
        style={{
          left: tooltip.x,
          top: tooltip.y,
          transform: 'translate(-50%, -100%)',
        }}
      >
        {tooltip.text}
      </div>
    </div>
  );
}
