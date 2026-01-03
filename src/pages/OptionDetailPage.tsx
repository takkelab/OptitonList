import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSpring, animated } from '@react-spring/web';
import { useOptions } from '../hooks/useOptions';
import { useNotes } from '../hooks/useNotes';
import { compressImage, getBase64Size } from '../utils/imageCompression';
import styles from './OptionDetailPage.module.css';

export const OptionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { options, updateOption, deleteOption } = useOptions();
  const { notes, addNote, deleteNote, deleteAllNotes } = useNotes(id || '');
  
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deleteMenuNote, setDeleteMenuNote] = useState<string | null>(null);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pressTimerRef = useRef<number>(0);

  // 達成アニメーション
  const celebrationSpring = useSpring({
    opacity: showCelebration ? 1 : 0,
    transform: showCelebration ? 'scale(1)' : 'scale(0.8)',
    config: { tension: 200, friction: 20 },
  });

  // 現在のオプションを取得
  const option = options.find(opt => opt.id === id);

  // メッセージ追加時に最下部へスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [notes]);

  const handleSubmit = () => {
    if ((!content.trim() && !imagePreview) || !id) return;

    addNote({
      content: content.trim() || '',
      image_data: imagePreview,
    });

    setContent('');
    setImagePreview(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }

    try {
      // 画像を圧縮
      const compressed = await compressImage(file);
      
      // サイズチェック（500KB制限）
      const sizeKB = getBase64Size(compressed);
      if (sizeKB > 500) {
        alert(`画像サイズが大きすぎます（${sizeKB.toFixed(0)}KB）。500KB以下の画像を選択してください。`);
        return;
      }

      setImagePreview(compressed);
    } catch (error) {
      console.error('画像の圧縮に失敗しました:', error);
      alert('画像の処理に失敗しました');
    }

    // input要素をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
  };

  const handleLongPressStart = (noteId: string) => {
    pressTimerRef.current = window.setTimeout(() => {
      setDeleteMenuNote(noteId);
    }, 500);
  };

  const handleLongPressEnd = () => {
    clearTimeout(pressTimerRef.current);
  };

  const handleDeleteNoteConfirm = () => {
    if (deleteMenuNote) {
      deleteNote(deleteMenuNote);
      setDeleteMenuNote(null);
    }
  };

  const handleDeleteNoteCancel = () => {
    setDeleteMenuNote(null);
  };

  const handleComplete = () => {
    setShowCompleteConfirm(true);
  };

  const handleCompleteConfirm = () => {
    if (!id || !option) return;

    // 達成証書を生成してメモに保存
    const certificate = generateCertificate();
    addNote({
      content: certificate,
      image_data: null,
    });

    // ステータスを完了に変更
    updateOption(id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });

    // 確認モーダルを閉じてアニメーション表示
    setShowCompleteConfirm(false);
    setShowCelebration(true);
  };

  const handleCelebrationClose = () => {
    console.log('handleCelebrationClose called');
    // 状態をリセットしてから遷移
    setShowCelebration(false);
    // 次のレンダリングサイクルで遷移を実行
    requestAnimationFrame(() => {
      console.log('Navigating to /');
      navigate('/');
    });
  };

  const handleCompleteCancel = () => {
    setShowCompleteConfirm(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteOptionConfirm = () => {
    if (!id) return;
    
    // メモを全て削除
    deleteAllNotes();
    
    // オプションを削除
    deleteOption(id);
    
    // ホームに戻る
    navigate('/');
  };

  const handleDeleteOptionCancel = () => {
    setShowDeleteConfirm(false);
  };

  const handleTitleClick = () => {
    if (option) {
      setEditedTitle(option.title);
      setIsEditingTitle(true);
    }
  };

  const handleTitleSave = () => {
    if (!id || !editedTitle.trim()) {
      setIsEditingTitle(false);
      return;
    }

    updateOption(id, { title: editedTitle.trim() });
    setIsEditingTitle(false);
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
  };

  const generateCertificate = () => {
    if (!option) return '';

    const startDate = new Date(option.created_at);
    const endDate = new Date();
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth() + 1;
    const startDay = startDate.getDate();
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth() + 1;
    const endDay = endDate.getDate();

    return `🎉 達成おめでとうございます！ 🎉

「${option.title}」

あなたは上記の目標を見事に達成されました。その努力と成果を称え、ここに表彰いたします。

📅 開始: ${startYear}年${startMonth}月${startDay}日
✅ 達成: ${endYear}年${endMonth}月${endDay}日
⏱️ 期間: ${diffDays}日間`;
  };

  if (!option) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>オプションが見つかりません</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ヘッダー */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          ←
        </button>
        <div className={styles.headerContent}>
          {isEditingTitle ? (
            <input
              type="text"
              className={styles.titleInput}
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyPress}
              autoFocus
              maxLength={200}
            />
          ) : (
            <h1 className={styles.title} onClick={handleTitleClick}>{option.title}</h1>
          )}
          <span className={`${styles.statusBadge} ${option.status === 'pending' ? styles.statusPending : styles.statusCompleted}`}>
            {option.status === 'pending' ? 'やりたい' : 'やった'}
          </span>
        </div>
        <button className={styles.deleteButtonHeader} onClick={handleDeleteClick} title="削除">
          🗑
        </button>
      </div>

      {/* メモ一覧 */}
      <div className={styles.messagesContainer}>
        {notes.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💭</div>
            <p className={styles.emptyText}>まだメモがありません</p>
          </div>
        ) : (
          notes.map(note => (
            <div
              key={note.id}
              className={styles.message}
              onMouseDown={() => handleLongPressStart(note.id)}
              onMouseUp={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
              onTouchStart={() => handleLongPressStart(note.id)}
              onTouchEnd={handleLongPressEnd}
            >
              {note.content && (
                <p className={styles.messageContent}>{note.content}</p>
              )}
              {note.image_data && (
                <img
                  src={note.image_data}
                  alt="添付画像"
                  className={styles.messageImage}
                />
              )}
              <p className={styles.messageTime}>{formatDateTime(note.created_at)}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className={styles.inputArea}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />
        
        <div className={styles.inputWrapper}>
          {imagePreview && (
            <div className={styles.imagePreviewContainer}>
              <img src={imagePreview} alt="プレビュー" className={styles.imagePreview} />
              <button
                className={styles.removeImageButton}
                onClick={handleRemoveImage}
                type="button"
              >
                ✕
              </button>
            </div>
          )}
          
          <div className={styles.inputRow}>
            <button
              className={styles.iconButton}
              onClick={handleImageButtonClick}
              type="button"
            >
              🖼️
            </button>
            
            <textarea
              className={styles.textarea}
              placeholder="メモを入力..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
            />
            
            {content.trim() || imagePreview ? (
              <button
                className={`${styles.iconButton} ${styles.sendButton}`}
                onClick={handleSubmit}
              >
                ↑
              </button>
            ) : (
              <button
                className={`${styles.iconButton} ${styles.completeButton}`}
                onClick={handleComplete}
                disabled={option?.status === 'completed'}
              >
                🎉
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 削除確認モーダル */}
      {deleteMenuNote && (
        <div className={styles.modal} onClick={handleDeleteNoteCancel}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <p className={styles.modalText}>このメモを削除しますか？</p>
            <div className={styles.modalButtons}>
              <button className={styles.modalButtonCancel} onClick={handleDeleteNoteCancel}>
                キャンセル
              </button>
              <button className={styles.modalButtonDelete} onClick={handleDeleteNoteConfirm}>
                削除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 完了確認モーダル */}
      {showCompleteConfirm && (
        <div className={styles.modal} onClick={handleCompleteCancel}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <p className={styles.modalText}>やり遂げましたか？</p>
            <div className={styles.modalButtons}>
              <button className={styles.modalButtonCancel} onClick={handleCompleteCancel}>
                まだ
              </button>
              <button className={styles.modalButtonComplete} onClick={handleCompleteConfirm}>
                やり遂げた！
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className={styles.modal} onClick={handleDeleteOptionCancel}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <p className={styles.modalText}>
              {option?.status === 'pending' 
                ? 'このやりたいを手放しますか？'
                : 'この記録を削除しますか？'
              }
            </p>
            <p className={styles.modalSubText}>全てのメモも削除されます</p>
            <div className={styles.modalButtons}>
              <button className={styles.modalButtonCancel} onClick={handleDeleteOptionCancel}>
                {option?.status === 'pending' ? '残す' : 'キャンセル'}
              </button>
              <button className={styles.modalButtonDelete} onClick={handleDeleteOptionConfirm}>
                {option?.status === 'pending' ? '手放す' : '削除'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 達成アニメーション */}
      {showCelebration && (
        <div className={styles.celebrationOverlay}>
          <animated.div style={celebrationSpring} className={styles.celebrationCard}>
            <div className={styles.celebrationContent}>
              <div className={styles.celebrationIcon}>🎉</div>
              <h2 className={styles.celebrationTitle}>達成おめでとうございます！</h2>
              <p className={styles.celebrationTask}>「{option?.title}」</p>
              <p className={styles.celebrationMessage}>
                あなたは上記の目標を見事に達成されました。<br />
                その努力と成果を称え、ここに表彰いたします。
              </p>
              {option && (() => {
                const startDate = new Date(option.created_at);
                const endDate = new Date();
                const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const startYear = startDate.getFullYear();
                const startMonth = startDate.getMonth() + 1;
                const startDay = startDate.getDate();
                const endYear = endDate.getFullYear();
                const endMonth = endDate.getMonth() + 1;
                const endDay = endDate.getDate();
                return (
                  <div className={styles.celebrationStats}>
                    <div>📅 開始: {startYear}年{startMonth}月{startDay}日</div>
                    <div>✅ 達成: {endYear}年{endMonth}月{endDay}日</div>
                    <div>⏱️ 期間: {diffDays}日間</div>
                  </div>
                );
              })()}
              <button className={styles.celebrationButton} onClick={handleCelebrationClose}>
                次の挑戦へ！
              </button>
            </div>
          </animated.div>
        </div>
      )}
    </div>
  );
}
