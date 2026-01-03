/**
 * 画像を圧縮してBase64文字列として返す
 * @param file - 画像ファイル
 * @param maxWidth - 最大幅（デフォルト: 800px）
 * @param quality - JPEG品質（デフォルト: 0.8）
 * @returns Promise<string> - Base64エンコードされた画像データ
 */
export const compressImage = async (
  file: File,
  maxWidth = 800,
  quality = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Canvas要素を作成
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        // アスペクト比を維持してリサイズ
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 画像を描画
        ctx.drawImage(img, 0, 0, width, height);
        
        // Base64に変換
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        
        resolve(compressedBase64);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Base64文字列のサイズをKB単位で計算
 * @param base64 - Base64エンコードされた文字列
 * @returns number - サイズ（KB）
 */
export const getBase64Size = (base64: string): number => {
  // Base64の実際のバイトサイズを計算
  const base64Length = base64.length - (base64.indexOf(',') + 1);
  const padding = (base64.match(/=/g) || []).length;
  const bytes = (base64Length * 3) / 4 - padding;
  return bytes / 1024;
};
