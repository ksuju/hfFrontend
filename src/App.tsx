import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Main from './pages/Main'
import Festival from './pages/Festival'
import Meeting from './pages/Meeting'

function App() {
  return (
    <Router>
      <div className="fixed inset-0 flex flex-col">
        <Header />
        <div className="flex-1 overflow-hidden">
          <main className="h-full overflow-y-auto">
            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/posts" element={<Festival />} />
              <Route path="/chatroom" element={<Meeting />} />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </Router>
  )
}

export default App