import AuthHeader from '../components/AuthHeader';

const Login = () => {
    return (
        <div className="min-h-screen flex flex-col bg-white lg:bg-gray-100">
            <AuthHeader />
            <div className="flex-1 flex flex-col justify-center px-4 pt-16 lg:pt-0">
                <div className="max-w-[430px] lg:max-w-screen-sm mx-auto w-full lg:bg-white lg:p-8 lg:rounded-2xl lg:shadow-md">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-semibold text-gray-800">로그인</h2>
                        <p className="text-gray-500 mt-2">환영합니다</p>
                    </div>

                    {/* 로그인 폼 */}
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
                        <button
                            type="submit"
                            className="w-full h-12 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                        >
                            로그인
                        </button>
                    </form>

                    {/* 회원가입 링크 */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-500">
                            아직 회원이 아니신가요?{' '}
                            <a href="/signup" className="text-primary font-medium">
                                회원가입
                            </a>
                        </p>
                    </div>

                    {/* 소셜 로그인 */}
                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">간편 로그인</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button className="w-full h-12 border border-gray-200 rounded-lg font-medium hover:border-primary transition-colors">
                                카카오
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login; 