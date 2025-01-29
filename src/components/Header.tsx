// Header.tsx
import {Link} from 'react-router-dom'

const Header = () => {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-30">
            <div className="max-w-[600px] lg:max-w-screen-lg mx-auto h-full px-4 flex justify-between items-center">
                <Link to="/" className="flex items-center">
                    <img src="/logo.png" alt="로고" className="h-8"/>
                    <span className="text-primary font-bold ml-2">숨은사람친구</span>
                </Link>
                <div className="flex items-center gap-2">
                    <Link to="/chat">채팅 테스트</Link>
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
                </div>
            </div>
        </header>
    )
}

export default Header
