import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useOptions } from '../hooks/useOptions'
import type { Option } from '../types'
import styles from './PendingListPage.module.css'

// ドラッグ可能なカードコンポーネント
const SortableCard = ({ option, onClick }: { option: Option; onClick: () => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none' as const,
  }

  const handleClick = () => {
    // ドラッグ中でなければクリックイベントを発火
    if (!isDragging) {
      onClick()
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={styles.card}
      {...attributes}
      {...listeners}
      onClick={handleClick}
    >
      <h3 className={styles.cardTitle}>{option.title}</h3>
    </div>
  )
}

export const PendingListPage = () => {
  const navigate = useNavigate()
  const { options, addOption, reorderOptions } = useOptions()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  // ドラッグセンサー設定（PCとモバイル両対応）
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // PCマウス: 即座にドラッグ開始
      activationConstraint: {
        distance: 10, // 10px移動したらドラッグ開始
      },
    }),
    useSensor(TouchSensor, {
      // モバイルタッチ: 長押しでドラッグ開始
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  // pendingステータスのオプションのみ表示
  const pendingOptions = options
    .filter(option => option.status === 'pending')
    .sort((a, b) => a.order - b.order)

  const handleAdd = () => {
    if (newTitle.trim().length === 0) {
      alert('タイトルを入力してください')
      return
    }
    if (newTitle.length > 200) {
      alert('タイトルは200文字以内で入力してください')
      return
    }

    addOption({
      title: newTitle.trim(),
      status: 'pending',
      source: 'user',
      completed_at: null,
    })

    setNewTitle('')
    setIsModalOpen(false)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    // pendingOptions内のインデックスを取得
    const oldIndexInPending = pendingOptions.findIndex(opt => opt.id === active.id)
    const newIndexInPending = pendingOptions.findIndex(opt => opt.id === over.id)

    if (oldIndexInPending !== -1 && newIndexInPending !== -1) {
      // 全体のoptions配列でのインデックスを取得
      const oldIndexInAll = options.findIndex(opt => opt.id === active.id)
      const newIndexInAll = options.findIndex(opt => opt.id === over.id)
      
      if (oldIndexInAll !== -1 && newIndexInAll !== -1) {
        reorderOptions(oldIndexInAll, newIndexInAll)
      }
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>やりたいことリスト</h1>
        <button
          className={styles.addButton}
          onClick={() => setIsModalOpen(true)}
        >
          ＋
        </button>
      </header>

      <div className={styles.content}>
        {pendingOptions.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyIcon}>🙌🏻</p>
            <p className={styles.emptyText}>リストが空です</p>
            <p className={styles.emptySubText}>
              やりたいことが思い浮かばないときは
              <br />
              AIの提案を見てみよう！
            </p>
          </div>
        ) : (
          <div className={styles.cardList}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={pendingOptions.map(opt => opt.id)}
                strategy={verticalListSortingStrategy}
              >
                {pendingOptions.map(option => (
                  <SortableCard
                    key={option.id}
                    option={option}
                    onClick={() => navigate(`/option/${option.id}`)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>

      {/* 追加モーダル */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>新しくやりたいこと</h2>
            <input
              type="text"
              className={styles.input}
              placeholder="タイトルを入力"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              maxLength={200}
            />
            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => {
                  setIsModalOpen(false)
                  setNewTitle('')
                }}
              >
                キャンセル
              </button>
              <button className={styles.submitButton} onClick={handleAdd}>
                追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

