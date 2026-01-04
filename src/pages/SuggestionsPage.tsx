import { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useSpring, animated } from '@react-spring/web';
import { Capacitor } from '@capacitor/core';
import { useOptions } from '../hooks/useOptions';
import type { Option } from '../types';
import styles from './SuggestionsPage.module.css';

interface Suggestion {
  id: number;
  title: string;
  category: string;
}

export const SuggestionsPage = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [currentSuggestion, setCurrentSuggestion] = useState<Suggestion | null>(null);
  const [nextSuggestion, setNextSuggestion] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const { addOption } = useOptions();
  const isNativeApp = Capacitor.isNativePlatform();

  // カードアニメーション
  const [{ x, rotate, opacity }, api] = useSpring(() => ({
    x: 0,
    rotate: 0,
    opacity: 1,
  }));

  // 次のカードのアニメーション
  const [nextCardSpring, nextCardApi] = useSpring(() => ({
    scale: 0.95,
    y: 10,
    opacity: 0.8,
  }));

  // スワイプ状態の管理
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // 提案データの読み込み
  useEffect(() => {
    fetch('/suggestions.json')
      .then(res => res.json())
      .then((data: Suggestion[]) => {
        setSuggestions(data);
        setCurrentSuggestion(getRandomSuggestion(data));
        setNextSuggestion(getRandomSuggestion(data));
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load suggestions:', error);
        setLoading(false);
      });
  }, []);

  // ランダムに提案を取得
  const getRandomSuggestion = (list: Suggestion[]): Suggestion | null => {
    if (list.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
  };

  // スキップ処理（右スワイプ）
  const handleSkip = () => {
    // 次の提案を準備
    const newNext = getRandomSuggestion(suggestions);
    
    // 右に飛ばすアニメーション
    api.start({
      x: 500,
      rotate: 30,
      opacity: 0,
      config: { tension: 200, friction: 20 },
    });

    // 下のカードが浮き上がるアニメーション
    nextCardApi.start({
      scale: 1,
      y: 0,
      opacity: 1,
      config: { tension: 200, friction: 20 },
    });

    // カードを入れ替え
    setTimeout(() => {
      setSwipeDirection(null);
      setCurrentSuggestion(nextSuggestion);
      setNextSuggestion(newNext);
      api.start({
        x: 0,
        rotate: 0,
        opacity: 1,
        immediate: true,
      });
      nextCardApi.start({
        scale: 0.95,
        y: 10,
        opacity: 0.8,
        immediate: true,
      });
    }, 300);
  };

  // リストに追加（左スワイプ）
  const handleAdd = () => {
    if (!currentSuggestion) return;

    // 次の提案を準備
    const newNext = getRandomSuggestion(suggestions);
    
    // 左に飛ばすアニメーション
    api.start({
      x: -500,
      rotate: -30,
      opacity: 0,
      config: { tension: 200, friction: 20 },
    });

    // 下のカードが浮き上がるアニメーション
    nextCardApi.start({
      scale: 1,
      y: 0,
      opacity: 1,
      config: { tension: 200, friction: 20 },
    });

    // カードを入れ替え
    setTimeout(() => {
      // やりたいリストに追加（アニメーション後に実行）
      const newOption: Option = {
        id: crypto.randomUUID(),
        title: currentSuggestion.title,
        status: 'pending',
        source: 'ai',
        order: Date.now(),
        created_at: new Date().toISOString(),
        completed_at: null,
      };
      addOption(newOption);

      setSwipeDirection(null);
      setCurrentSuggestion(nextSuggestion);
      setNextSuggestion(newNext);
      api.start({
        x: 0,
        rotate: 0,
        opacity: 1,
        immediate: true,
      });
      nextCardApi.start({
        scale: 0.95,
        y: 10,
        opacity: 0.8,
        immediate: true,
      });
    }, 300);
  };

  // スワイプハンドラー
  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      const { deltaX } = eventData;
      
      // スワイプ方向を判定
      if (deltaX < -50) {
        setSwipeDirection('left');
      } else if (deltaX > 50) {
        setSwipeDirection('right');
      } else {
        setSwipeDirection(null);
      }
      
      api.start({
        x: deltaX,
        rotate: deltaX * 0.05,
        opacity: 1 - Math.abs(deltaX) / 500,
        immediate: true,
      });
    },
    onSwipedLeft: () => {
      if (Math.abs(x.get()) > 100) {
        handleAdd(); // 左スワイプで追加
      } else {
        api.start({ x: 0, rotate: 0, opacity: 1 });
        setSwipeDirection(null);
      }
    },
    onSwipedRight: () => {
      if (Math.abs(x.get()) > 100) {
        handleSkip(); // 右スワイプでスキップ
      } else {
        api.start({ x: 0, rotate: 0, opacity: 1 });
        setSwipeDirection(null);
      }
    },
    trackMouse: true,
    trackTouch: true,
  });

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>読み込み中...</div>
      </div>
    );
  }

  if (!currentSuggestion) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>✨</div>
          <p className={styles.emptyText}>提案がありません</p>
          <p className={styles.emptySubText}>データの読み込みに失敗しました</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${isNativeApp ? styles.nativeApp : styles.webApp}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>新しい体験、見つけよう</h1>
        <p className={styles.subtitle}>「やってみたい」と思ったら左にスワイプ！</p>
      </div>

      <div className={styles.cardContainer}>
        {/* 次のカード（下に配置） */}
        {nextSuggestion && (
          <animated.div
            className={`${styles.card} ${styles.nextCard}`}
            style={{
              transform: nextCardSpring.scale.to(s => `scale(${s}) translateY(${nextCardSpring.y.get()}px)`),
              opacity: nextCardSpring.opacity,
            }}
          >
            <span className={styles.category}>{nextSuggestion.category}</span>
            <h2 className={styles.cardTitle}>{nextSuggestion.title}</h2>
          </animated.div>
        )}

        {/* 現在のカード（上に配置） */}
        <animated.div
          {...handlers}
          className={styles.card}
          style={{
            x,
            rotate: rotate.to(r => `${r}deg`),
            opacity,
          }}
        >
          <span className={styles.category}>{currentSuggestion.category}</span>
          <h2 className={styles.cardTitle}>{currentSuggestion.title}</h2>
          
          {/* スワイプエフェクト */}
          {swipeDirection === 'left' && (
            <div className={`${styles.swipeOverlay} ${styles.swipeOverlayAdd}`}>
              <div className={styles.swipeText}>♡ 追加！</div>
            </div>
          )}
          {swipeDirection === 'right' && (
            <div className={`${styles.swipeOverlay} ${styles.swipeOverlaySkip}`}>
              <div className={styles.swipeText}>✗ スキップ</div>
            </div>
          )}
        </animated.div>
      </div>

      <div className={styles.buttonGroup}>
        <button
          className={`${styles.actionButton} ${styles.addButton}`}
          onClick={handleAdd}
        >
          ♡
        </button>
        <button
          className={`${styles.actionButton} ${styles.skipButton}`}
          onClick={handleSkip}
        >
          ✗
        </button>
      </div>
    </div>
  );
}
