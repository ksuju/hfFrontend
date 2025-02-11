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
import { AlertProvider } from './providers/AlertProvider';
import FestivalDetail from "./pages/FestivalDetail.tsx";
import Admin from './pages/Admin'
import NoticeWrite from './pages/Admin/components/NoticeWrite'
import NoticeEdit from './pages/Admin/components/NoticeEdit'

// ProtectedAdminRoute 컴포넌트 추가
const ProtectedAdminRoute = () => {
    const userInfo = localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo')!).data
        : null;

    if (!userInfo) {
        return <Navigate to="/login" replace />;
    }

    if (userInfo.role !== 'ROLE_ADMIN') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">접근 권한 없음</h2>
                    <p className="text-gray-600 mb-4">관리자만 접근할 수 있는 페이지입니다.</p>
                    <button
                        onClick={() => window.history.back()}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        이전 페이지로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return <Admin />;
};

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [userInfo, setUserInfo] = useState(() =>
        localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')!) : null
    );

    const updateUserInfo = (newUserInfo: any) => {
        setUserInfo(newUserInfo);
        localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
    };

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
                setUserInfo(data);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userInfo', JSON.stringify(data));
            } else {
                console.log('인증 실패');
                setIsLoggedIn(false);
                setUserInfo(null);
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userInfo');
            }
        } catch (error) {
            console.error('인증 체크 에러:', error);
            setIsLoggedIn(false);
            setUserInfo(null);
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userInfo');
        }
    };

    useEffect(() => {
        console.log('useEffect 실행');
        checkLoginStatus(); // 직접 체크 먼저 실행
    }, []);

    return (
        <Router>
            <AlertProvider isLoggedIn={isLoggedIn} isOpen={isAlertOpen}>
                <div className="min-h-screen flex flex-col bg-white lg:bg-gray-100">
                    <Header
                        isLoggedIn={isLoggedIn}
                        setIsLoggedIn={setIsLoggedIn}
                        isAlertOpen={isAlertOpen}
                        setIsAlertOpen={setIsAlertOpen}
                        userInfo={userInfo}
                    />
                    <Routes>
                        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/find-account" element={<FindAccount />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/admin/*" element={<ProtectedAdminRoute />} />
                        <Route path="/admin/notice/write" element={<NoticeWrite />} />
                        <Route path="/admin/notice/edit/:id" element={<NoticeEdit />} />
                        <Route path="/*" element={
                            <div className="flex flex-col min-h-screen">
                                <main className="flex-1 mt-16 mb-16">
                                    <div className="max-w-[600px] lg:max-w-screen-lg mx-auto lg:py-6">
                                        <div className="bg-white lg:rounded-2xl lg:shadow-md">
                                            <Routes>
                                                <Route path="/" element={<Main />} />
                                                <Route path="/posts" element={<Festival />} />
                                                <Route path="/chatroom" element={<Meeting />} />
                                                <Route path="/notice" element={<Notice />} />
                                                <Route path="/notice/:id" element={
                                                    <NoticeDetail
                                                        isLoggedIn={isLoggedIn}
                                                        setIsLoggedIn={setIsLoggedIn}
                                                        isAlertOpen={isAlertOpen}
                                                        setIsAlertOpen={setIsAlertOpen}
                                                    />
                                                } />
                                                <Route path="/chat/:chatRoomId" element={userInfo ? (
                                                    <Chat memberId={userInfo.id} />
                                                ) : (
                                                    <Navigate to="/login" replace />
                                                )} />
                                                <Route path="/mypage" element={<MyPage updateUserInfo={updateUserInfo} />} />
                                                <Route path="/map" element={<FestivalMap />} />
                                                <Route path="/detailposts" element={<FestivalDetail />} />
                                            </Routes>
                                        </div>
                                    </div>
                                </main>
                                <Footer />
                            </div>
                        } />
                    </Routes>
                </div>
            </AlertProvider>
        </Router>
    )
}

export default App
