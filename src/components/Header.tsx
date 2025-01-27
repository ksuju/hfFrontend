import { Link } from 'react-router-dom'

const Header = () => {
  return (
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-[430px] mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="로고" className="w-8 h-8" />
            <h1 className="text-primary font-bold text-lg">숨은사람친구</h1>
          </Link>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm border border-primary text-primary rounded-full">
              로그인
            </button>
            <button className="px-3 py-1 text-sm bg-primary text-white rounded-full">
              회원가입
            </button>
          </div>
        </div>
      </header>
  )
}

export default Header