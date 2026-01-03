import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { PendingListPage } from './pages/PendingListPage'
import { SuggestionsPage } from './pages/SuggestionsPage'
import { CompletedListPage } from './pages/CompletedListPage'
import { OptionDetailPage } from './pages/OptionDetailPage'
import { TabNavigation } from './components/TabNavigation'
import './App.css'

function App() {
  useEffect(() => {
    // ネイティブプラットフォーム（iOS/Android）の場合のみ実行
    if (Capacitor.isNativePlatform()) {
      // ステータスバーを明るい背景用に設定
      StatusBar.setStyle({ style: Style.Light }).catch(() => {
        // エラーは無視（WebやStatusBarが無効な場合）
      })
    }
  }, [])

  return (
    <BrowserRouter>
      <div className="app-container">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<PendingListPage />} />
            <Route path="/suggestions" element={<SuggestionsPage />} />
            <Route path="/completed" element={<CompletedListPage />} />
            <Route path="/option/:id" element={<OptionDetailPage />} />
          </Routes>
        </main>
        <TabNavigation />
      </div>
    </BrowserRouter>
  )
}

export default App