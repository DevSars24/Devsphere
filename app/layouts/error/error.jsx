import { Link } from '@remix-run/react';
import { isRouteErrorResponse } from '@remix-run/react';
import styles from './error.module.css';

export function Error({ error }) {
  let status = '–';
  let title = 'Something went wrong';
  let message = 'An unexpected error occurred. Please try again.';

  if (isRouteErrorResponse(error)) {
    status = error.status;
    if (error.status === 404) {
      title = 'Page not found';
      message = "This page doesn't exist or was deleted.";
    } else if (error.status === 405) {
      title = 'Method not allowed';
      message = typeof error.data === 'string' ? error.data : 'Method not allowed.';
    } else {
      message = typeof error.data === 'string' ? error.data : error.statusText || message;
    }
  } else if (error instanceof Error) {
    message = error.message || message;
  }

  return (
    <section className={styles.page}>
      <div className={styles.details}>
        <div className={styles.text}>
          <h1 className={styles.title}>{status}</h1>
          <h2 className={styles.subheading}>{title}</h2>
          <p className={styles.description}>{message}</p>
          <Link to="/" className={styles.button}>
            ← Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}