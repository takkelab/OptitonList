import { useNavigate } from 'react-router-dom';
import { useOptions } from '../hooks/useOptions';
import styles from './PendingListPage.module.css';

export const CompletedListPage = () => {
  const navigate = useNavigate();
  const { options } = useOptions();

  // completedステータスのオプションのみフィルタ、完了日時の新しい順
  const completedOptions = options
    .filter(option => option.status === 'completed')
    .sort((a, b) => {
      if (!a.completed_at) return 1;
      if (!b.completed_at) return -1;
      return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime();
    });

  const formatCompletedDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日に達成`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>やったことリスト</h1>
      </div>

      {completedOptions.length === 0 ? (
        <div className={styles.content}>
          <div className={`${styles.emptyState} ${styles.completedEmptyState}`}>
            <p className={styles.emptyIcon}>✓</p>
            <p className={styles.emptyText}>リストが空です</p>
            <p className={styles.emptySubText}>やりたいリストから挑戦してみよう！</p>
          </div>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.cardList}>
            {completedOptions.map(option => (
              <div
                key={option.id}
                className={`${styles.card} ${styles.completedCard}`}
                onClick={() => navigate(`/option/${option.id}`)}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.completedBadge}>✓</span>
                  <h3 className={styles.cardTitle}>{option.title}</h3>
                </div>
                {option.completed_at && (
                  <p className={styles.completedDate}>
                    {formatCompletedDate(option.completed_at)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
