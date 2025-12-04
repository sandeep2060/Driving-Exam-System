import { Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './components/pages/Home'
import DashboardPage from './components/pages/DashboardPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  )
}

export default App
