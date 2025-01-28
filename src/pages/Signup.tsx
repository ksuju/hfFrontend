import { Link } from 'react-router-dom';
import AuthHeader from '../components/AuthHeader';

const Signup = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <AuthHeader />
            <div className="flex-1 flex flex-col justify-center px-4 pt-16">
                <div className="max-w-[430px] mx-auto w-full">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-semibold text-gray-800">회원가입</h2>
                        <p className="text-gray-500 mt-2">정보를 입력해주세요</p>
                    </div>

                    <form className="space-y-4">
                        <div>
                            <input
                                type="email"
                                placeholder="이메일"
                                className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="비밀번호"
                                className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="비밀번호 확인"
                                className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="닉네임"
                                className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full h-12 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                        >
                            가입하기
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-500">
                            이미 계정이 있으신가요?{' '}
                            <Link to="/login" className="text-primary font-medium">
                                로그인
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup; 