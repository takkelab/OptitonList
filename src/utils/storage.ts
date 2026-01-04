// PWA環境でも安定して動作するストレージユーティリティ

export const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    // 書き込み直後に読み込んで確認
    const verify = localStorage.getItem(key);
    if (verify !== value) {
      console.error('Storage verification failed for key:', key);
      return false;
    }
    console.log('Storage successfully saved:', key);
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
};

export const safeGetItem = (key: string): string | null => {
  try {
    const value = localStorage.getItem(key);
    console.log('Storage retrieved:', key, value ? 'found' : 'not found');
    return value;
  } catch (error) {
    console.error('Failed to get from localStorage:', error);
    return null;
  }
};

// PWAモードかどうかを判定
export const isPWAMode = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

// ストレージの健全性チェック
export const checkStorageHealth = (): boolean => {
  try {
    const testKey = '__storage_test__';
    const testValue = 'test';
    localStorage.setItem(testKey, testValue);
    const result = localStorage.getItem(testKey) === testValue;
    localStorage.removeItem(testKey);
    console.log('Storage health check:', result ? 'OK' : 'FAILED');
    return result;
  } catch {
    console.log('Storage health check: FAILED');
    return false;
  }
};
