import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BookingFlow from './components/BookingFlow'
import AdminPage from './components/admin/AdminPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BookingFlow />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App