import { Link, useLocation } from 'react-router-dom'
import styles from './TabNavigation.module.css'

export const TabNavigation = () => {
  const location = useLocation()

  // 詳細画面の場合はタブを表示しない
  if (location.pathname.startsWith('/option/')) {
    return null
  }

  return (
    <nav className={styles.tabBar}>
      <Link
        to="/"
        className={`${styles.tabItem} ${location.pathname === '/' ? styles.active : ''}`}
      >
        <span className={styles.icon}>🏃🏻‍♂️‍➡️</span>
        <span className={styles.label}>やりたい</span>
      </Link>

      <Link
        to="/suggestions"
        className={`${styles.tabItem} ${location.pathname === '/suggestions' ? styles.active : ''}`}
      >
        <span className={styles.icon}>🪄</span>
        <span className={styles.label}>AI提案</span>
      </Link>

      <Link
        to="/completed"
        className={`${styles.tabItem} ${location.pathname === '/completed' ? styles.active : ''}`}
      >
        <span className={styles.icon}>🏅</span>
        <span className={styles.label}>やった</span>
      </Link>
    </nav>
  )
}
