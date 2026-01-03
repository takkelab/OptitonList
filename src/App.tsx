import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PendingListPage } from './pages/PendingListPage'
import { SuggestionsPage } from './pages/SuggestionsPage'
import { CompletedListPage } from './pages/CompletedListPage'
import { OptionDetailPage } from './pages/OptionDetailPage'
import { TabNavigation } from './components/TabNavigation'
import './App.css'

function App() {
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