import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export function useCamera() {
  const isNative = Capacitor.isNativePlatform();

  const takePicture = async (): Promise<string | null> => {
    if (!isNative) {
      // Web版：従来のfile inputを使用
      return null; // コンポーネント側でfile inputを表示
    }

    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt, // カメラor写真ライブラリを選択
      });

      return `data:image/jpeg;base64,${image.base64String}`;
    } catch (error) {
      console.error('カメラエラー:', error);
      return null;
    }
  };

  return { takePicture, isNative };
}
