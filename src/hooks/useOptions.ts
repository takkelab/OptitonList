import { useState, useEffect } from 'react';
import type { Option } from '../types';
import { STORAGE_KEYS } from '../types';

// UUID生成関数（crypto.randomUUIDの代替）
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const useOptions = () => {
  const [options, setOptions] = useState<Option[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 初回読み込み
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.OPTIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        setOptions(parsed);
      }
    } catch (error) {
      console.error('Failed to load options from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 変更時に自動保存
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEYS.OPTIONS, JSON.stringify(options));
      } catch (error) {
        console.error('Failed to save options to localStorage:', error);
      }
    }
  }, [options, isLoaded]);

  // オプションを追加
  const addOption = (newOption: Omit<Option, 'id' | 'created_at' | 'order'>) => {
    const option: Option = {
      id: generateId(),
      ...newOption,
      order: options.length,
      created_at: new Date().toISOString(),
    };
    console.log('useOptions - Adding option:', option);
    setOptions(prev => {
      const updated = [...prev, option];
      console.log('useOptions - Updated options:', updated);
      return updated;
    });
  };

  // オプションを更新
  const updateOption = (id: string, updates: Partial<Option>) => {
    setOptions(prev =>
      prev.map(option =>
        option.id === id ? { ...option, ...updates } : option
      )
    );
  };

  // オプションを削除
  const deleteOption = (id: string) => {
    setOptions(prev => prev.filter(option => option.id !== id));
  };

  // 並び替え（order値を再計算）
  const reorderOptions = (startIndex: number, endIndex: number) => {
    const result = Array.from(options);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    // order値を再設定
    const reordered = result.map((option, index) => ({
      ...option,
      order: index,
    }));

    setOptions(reordered);
  };

  return {
    options,
    addOption,
    updateOption,
    deleteOption,
    reorderOptions,
  };
};
