import { useState, useEffect } from 'react';
import type { Note } from '../types';
import { STORAGE_KEYS } from '../types';

// UUID生成関数（crypto.randomUUIDの代替）
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const useNotes = (optionId: string) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 初回読み込み（全Notesから該当optionIdのものをフィルタ）
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (stored) {
        const allNotes: Note[] = JSON.parse(stored);
        const filteredNotes = allNotes.filter(note => note.option_id === optionId);
        setNotes(filteredNotes);
      }
    } catch (error) {
      console.error('Failed to load notes from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, [optionId]);

  // 変更時に自動保存（全Notesを更新）
  useEffect(() => {
    if (isLoaded) {
      try {
        // 全Notesを読み込み
        const stored = localStorage.getItem(STORAGE_KEYS.NOTES);
        const allNotes: Note[] = stored ? JSON.parse(stored) : [];
        
        // 他のoptionのNotesを保持しつつ、現在のoptionのNotesを更新
        const otherNotes = allNotes.filter(note => note.option_id !== optionId);
        const updatedNotes = [...otherNotes, ...notes];
        
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updatedNotes));
      } catch (error) {
        console.error('Failed to save notes to localStorage:', error);
      }
    }
  }, [notes, optionId, isLoaded]);

  // メモを追加
  const addNote = (newNote: Omit<Note, 'id' | 'option_id' | 'created_at'>) => {
    // content と image_data の少なくとも一方が必要
    if (!newNote.content && !newNote.image_data) {
      console.error('Note must have either content or image_data');
      return;
    }

    const note: Note = {
      id: generateId(),
      option_id: optionId,
      ...newNote,
      created_at: new Date().toISOString(),
    };
    setNotes(prev => [...prev, note]);
  };

  // メモを削除（プロトタイプでは未使用だが、将来のために実装）
  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };

  // 特定optionの全メモを削除（option削除時に使用）
  const deleteAllNotes = () => {
    setNotes([]);
  };

  return {
    notes,
    addNote,
    deleteNote,
    deleteAllNotes,
  };
};
