// データモデルの型定義

export interface Option {
  id: string;              // UUID（自動生成）
  title: string;           // やりたいことのタイトル
  status: 'pending' | 'completed';  // ステータス
  source: 'user' | 'ai';   // 追加元
  order: number;           // 表示順（並び替え用）
  created_at: string;      // ISO 8601形式
  completed_at: string | null;  // 完了日時（未完了時はnull）
}

export interface Note {
  id: string;              // UUID（自動生成）
  option_id: string;       // 紐づくOption.id
  content: string | null;  // メモ本文
  image_data: string | null;  // Base64エンコードされた画像データ
  created_at: string;      // ISO 8601形式
}

// LocalStorageのキー名
export const STORAGE_KEYS = {
  OPTIONS: 'optionlist_options',
  NOTES: 'optionlist_notes',
} as const;
