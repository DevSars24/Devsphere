import { useState, useEffect } from 'react';
import styles from './github-graph.module.css';

export function GitHubGraph({ username }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('GitHub fetch failed:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [username]);

  if (loading) return <div className={styles.loading}>Loading Contributions<span className={styles.loadingDots}></span></div>;
  if (!data) return null;

  // Take only last 20 weeks for better bento grid fit
  const contributions = data.contributions.slice(-140); 
  const weeks = [];
  for (let i = 0; i < contributions.length; i += 7) {
    weeks.push(contributions.slice(i, i + 7));
  }

  return (
    <div className={styles.graph}>
      <div className={styles.header}>
        <span className={styles.title}>GITHUB ACTIVITY</span>
        <span className={styles.totalCount}>{data.total.lastYear} contributions in the last year</span>
      </div>
      <div className={styles.grid}>
        {weeks.map((week, wi) => (
          <div key={wi} className={styles.week}>
            {week.map((day, di) => (
              <div
                key={di}
                className={styles.cell}
                data-level={day.level}
                title={`${day.count} contributions on ${day.date}`}
                style={{ animationDelay: `${(wi * 7 + di) * 5}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
