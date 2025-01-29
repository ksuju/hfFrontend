// App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Main from './pages/Main'
import Festival from './pages/Festival'
import Meeting from './pages/Meeting'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Chat from "../websocket-app/src/components/Chat.tsx";
import FestivalMap from "./pages/FestivalMap.tsx";

function App() {
    return (
        <Router>
            <div className="min-h-screen flex flex-col bg-white lg:bg-gray-100">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/*" element={
                        <div className="flex flex-col min-h-screen">
                            <Header />
                            <main className="flex-1 mt-16 mb-16">
                                <div className="max-w-[600px] lg:max-w-screen-lg mx-auto lg:py-6">
                                    <div className="bg-white lg:rounded-2xl lg:shadow-md">
                                        <Routes>
                                            <Route path="/" element={<Main />} />
                                            <Route path="/posts" element={<Festival />} />
                                            <Route path="/chatroom" element={<Meeting />} />
                                            <Route path="/chat" element={<Chat chatRoomId={1} memberId={1}/>}/>
                                            <Route path="/map" element={<FestivalMap />} />  {/* 공연 지도 페이지 추가 */}
                                        </Routes>
                                    </div>
                                </div>
                            </main>
                            <Footer />
                        </div>
                    } />
                </Routes>
            </div>
        </Router>
    )
}

export default App
