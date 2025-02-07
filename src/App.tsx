// App.tsx
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Main from './pages/Main'
import Festival from './pages/Festival'
import Meeting from './pages/Meeting'
import Login from './pages/Login'
import Signup from './pages/Signup'
import MyPage from './pages/MyPage'
import Chat from "../websocket-app/src/components/Chat.tsx";
import FestivalMap from "./pages/FestivalMap.tsx";
import FindAccount from './pages/FindAccount';
import ResetPassword from './pages/ResetPassword';
import Notice from './pages/Notice';
import NoticeDetail from './pages/NoticeDetail';


const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    console.log('App 컴포넌트 렌더링');

    const checkLoginStatus = async () => {
        console.log('로그인 상태 체크 시작');
        try {
            const response = await fetch(import.meta.env.VITE_CORE_API_BASE_URL + "/api/v1/auth/me", {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('서버 응답:', response);

            if (response.ok) {
                const data = await response.json();
                console.log('받아온 회원정보:', data);
                setIsLoggedIn(true);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userInfo', JSON.stringify(data));
            } else {
                console.log('인증 실패');
                setIsLoggedIn(false);
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userInfo');
            }
        } catch (error) {
            console.error('인증 체크 에러:', error);
            setIsLoggedIn(false);
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userInfo');
        }
    };

    useEffect(() => {
        console.log('useEffect 실행');
        checkLoginStatus(); // 직접 체크 먼저 실행
    }, []);

    // localStorage에서 memberId 가져오기 (채팅 테스트)
    const userInfo = localStorage.getItem('userInfo') 
        ? JSON.parse(localStorage.getItem('userInfo')!).data 
        : null;

    return (
        <Router>
            <div className="min-h-screen flex flex-col bg-white lg:bg-gray-100">
                <Routes>
                    <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/find-account" element={<FindAccount />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/*" element={
                        <div className="flex flex-col min-h-screen">
                            <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
                            <main className="flex-1 mt-16 mb-16">
                                <div className="max-w-[600px] lg:max-w-screen-lg mx-auto lg:py-6">
                                    <div className="bg-white lg:rounded-2xl lg:shadow-md">
                                        <Routes>
                                            <Route path="/" element={<Main />} />
                                            <Route path="/posts" element={<Festival />} />
                                            <Route path="/chatroom" element={<Meeting />} />
                                            <Route path="/notice" element={<Notice />} />
                                            <Route path="/notice/:id" element={<NoticeDetail />} />
                                            <Route path="/chat/:chatRoomId" element={userInfo ? (
                                                <Chat memberId={userInfo.id} />
                                            ) : (
                                                <Navigate to="/login" replace />
                                            )} />
                                            <Route path="/mypage" element={<MyPage />} />
                                            <Route path="/map" element={<FestivalMap />} />
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
