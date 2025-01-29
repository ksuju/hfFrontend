// Header.tsx
import { Link } from 'react-router-dom'
import logo from '../assets/images/logo.png'

interface HeaderProps {
    isLoggedIn: boolean;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header = ({ isLoggedIn, setIsLoggedIn }: HeaderProps) => {
    const handleLogout = async () => {
        try {
            await fetch(import.meta.env.VITE_CORE_API_BASE_URL + '/api/v1/auth/logout', {
                method: 'GET',
                credentials: 'include', // 쿠키 포함
            });
            setIsLoggedIn(false);
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userInfo');
        } catch (error) {
            console.error('로그아웃 실패:', error);
        }
    };


    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-30">
            <div className="max-w-[600px] lg:max-w-screen-lg mx-auto h-full px-4 flex justify-between items-center">
                <Link to="/" className="flex items-center">
                    <img src={logo} alt="로고" className="h-8" />
                    <span className="text-primary font-bold ml-2">숨은사람친구</span>
                </Link>
                <div className="flex items-center gap-2">
                    <Link to="/chat">채팅 테스트</Link>
                    {!isLoggedIn ? (
                        <>
                            <Link
                                to="/login"
                                className="px-4 py-2 text-sm text-gray-600 hover:text-primary transition-colors lg:text-base"
                            >
                                로그인
                            </Link>
                            <Link
                                to="/signup"
                                className="px-4 py-2 text-sm text-white bg-primary rounded-full hover:bg-opacity-90 transition-colors lg:text-base"
                            >
                                회원가입
                            </Link>
                        </>
                    ) : (
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-primary transition-colors lg:text-base"
                        >
                            로그아웃
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;