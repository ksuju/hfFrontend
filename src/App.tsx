import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Chat from '../websocket-app/src/components/Chat';
import Main from './pages/Main'
import Festival from './pages/Festival'
import Meeting from './pages/Meeting'
import Login from './pages/Login'
import Signup from './pages/Signup'

function App() {

    return (
        <Router>
            <div className="fixed inset-0 flex flex-col bg-white">
                <Routes>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/signup" element={<Signup/>}/>
                    <Route path="/*" element={
                        <>
                            <Header/>
                            <main className="flex-1 overflow-y-auto">
                                <Routes>
                                    <Route path="/" element={<Main/>}/>
                                    <Route path="/posts" element={<Festival/>}/>
                                    <Route path="/chatroom" element={<Meeting/>}/>
                                    <Route path="/chat" element={<Chat chatRoomId={1} memberId={1}/>}/>
                                </Routes>
                            </main>
                            <Footer/>
                        </>
                    }/>
                </Routes>
            </div>
        </Router>
    )
}

export default App