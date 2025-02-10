// Header.tsx
import { Link } from 'react-router-dom'
import logo from '../assets/images/logo.png'
import { AlertBell } from './AlertBell';

interface HeaderProps {
    isLoggedIn: boolean;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header = ({ isLoggedIn, setIsLoggedIn }: HeaderProps) => {
    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')!) : null;

    const handleLogout = async () => {
        try {
            const memberId = userInfo?.data?.id; // userInfo에서 사용자 ID 추출

            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/auth/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    memberId: memberId
                })
            }
            );

            if (response.ok) {
                setIsLoggedIn(false);
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userInfo');
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '로그아웃에 실패했습니다.');
            }
        } catch (error) {
            console.error('로그아웃 에러:', error);
            alert('서버 연결에 실패했습니다.');
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-30">
            <div className="max-w-[600px] lg:max-w-screen-lg mx-auto h-full px-4 flex justify-between items-center">
                <Link to="/" className="flex items-center">
                    <img src={logo} alt="로고" className="h-8" />
                    <span className="text-primary font-bold ml-2">숨은사람친구</span>
                </Link>
                <div className="flex items-center gap-4">
                    {!isLoggedIn ? (
                        <>
                            <Link
                                to="/login"
                                className="px-4 py-1.5 text-sm font-medium text-primary hover:text-white hover:bg-primary rounded-full transition-all duration-200"
                            >
                                로그인
                            </Link>
                            <Link
                                to="/signup"
                                className="px-4 py-1.5 text-sm font-medium text-primary bg-white hover:text-white hover:bg-red-500 rounded-full transition-all duration-200"
                            >
                                회원가입
                            </Link>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <AlertBell />
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                    {userInfo?.data?.profilePath ? (
                                        <img
                                            src={userInfo.data.profilePath.startsWith('http')
                                                ? userInfo.data.profilePath
                                                : `https://kr.object.ncloudstorage.com/hf-bucket2025/member/${userInfo.data.profilePath}`}
                                            alt="프로필"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-gray-500 text-sm">
                                            {userInfo?.data?.nickname?.[0] || '?'}
                                        </span>
                                    )}
                                </div>
                                <span className="text-sm text-gray-600">
                                    {userInfo?.data?.nickname || '사용자'}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-1.5 text-sm font-medium text-primary hover:text-white hover:bg-red-500 rounded-full transition-all duration-200"
                            >
                                로그아웃
                            </button>
                        </div>
                    )}
                    {userInfo?.data?.role === 'ADMIN' && (
                        <Link 
                            to="/admin"
                            className="px-4 py-1.5 text-sm font-medium text-primary hover:text-white hover:bg-primary rounded-full transition-all duration-200"
                        >
                            관리자
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;