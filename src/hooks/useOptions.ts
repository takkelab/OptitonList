import { useState, useEffect } from 'react';
import type { Option } from '../types';
import { STORAGE_KEYS } from '../types';
import { safeGetItem, safeSetItem, isPWAMode, checkStorageHealth } from '../utils/storage';

// UUID生成関数（crypto.randomUUIDの代替）
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const useOptions = () => {
  const [options, setOptions] = useState<Option[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 初回読み込み
  useEffect(() => {
    console.log('useOptions - Loading from localStorage...');
    console.log('useOptions - Running as PWA:', isPWAMode());
    console.log('useOptions - Storage health:', checkStorageHealth());
    try {
      const stored = safeGetItem(STORAGE_KEYS.OPTIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('useOptions - Parsed options:', parsed);
        setOptions(parsed);
      } else {
        console.log('useOptions - No stored data found');
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
      console.log('useOptions - Saving to localStorage:', options);
      try {
        const success = safeSetItem(STORAGE_KEYS.OPTIONS, JSON.stringify(options));
        if (success) {
          console.log('useOptions - Save successful');
        } else {
          console.error('useOptions - Save failed verification');
        }
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
