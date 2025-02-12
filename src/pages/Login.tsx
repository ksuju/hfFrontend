import { useState, useEffect } from 'react';
import AuthHeader from '../components/AuthHeader';
import kakaoSimpleIcon from '../assets/images/kakaotalk_simple_icon2.png';
import googleSimpleIcon from '../assets/images/google_simple_icon.png';
import naverSimpleIcon from '../assets/images/naver_simple_icon.png';
import githubSimpleIcon from '../assets/images/github_simple_icon.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';

interface LoginProps {
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const Login: React.FC<LoginProps> = ({ setIsLoggedIn }) => {
    const socialLoginForKakaoUrl = import.meta.env.VITE_CORE_API_BASE_URL + `/oauth2/authorization/kakao`; // 카카오 로그인 요청 URL
    const socialLoginForGoogleUrl = import.meta.env.VITE_CORE_API_BASE_URL + `/oauth2/authorization/google`; // 구글 로그인 요청 URL
    const socialLoginForNaverUrl = import.meta.env.VITE_CORE_API_BASE_URL + `/oauth2/authorization/naver`;  // 네이버 로그인 요청 URL
    const socialLoginForGithubUrl = import.meta.env.VITE_CORE_API_BASE_URL + `/oauth2/authorization/github`;  // 깃허브 로그인 요청 URL
    const redirectUrlAfterSocialLogin = import.meta.env.VITE_CORE_FRONT_BASE_URL; // 카카오 로그인 후 리다이렉트 URL
    const navigate = useNavigate();
    const location = useLocation();

    // from 파라미터 추출
    const from = location.state?.from?.pathname || '/';

    // 로그인 폼 입력 값 상태 관리
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [saveEmail, setSaveEmail] = useState(false);

    useEffect(() => {
        const savedEmail = localStorage.getItem('savedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setSaveEmail(true);
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/auth/login`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                }
            );

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('accessToken', data.data.accessToken);
                localStorage.setItem('refreshToken', data.data.refreshToken);
                if (saveEmail) {
                    localStorage.setItem('savedEmail', email);
                } else {
                    localStorage.removeItem('savedEmail');
                }

                // 사용자 정보 즉시 조회
                const userResponse = await fetch(
                    `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/auth/me`,
                    {
                        credentials: 'include',
                        headers: {
                            'Authorization': `Bearer ${data.data.accessToken}`,
                            'Content-Type': 'application/json',
                        }
                    }
                );

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    localStorage.setItem('userInfo', JSON.stringify(userData));
                    localStorage.setItem('isLoggedIn', 'true');
                    setIsLoggedIn(true);
                    navigate(from, { replace: true });
                    window.location.reload();
                }
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('로그인 중 오류가 발생했습니다.');
        }
    };

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
                    <form className="space-y-4" onSubmit={handleLogin}>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="이메일"
                                className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-primary pr-32"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Link
                                to="/find-account"
                                className="absolute right-0 top-0 h-full px-4 flex items-center text-sm text-gray-500 hover:text-primary"
                            >
                                아이디를 잊었나요?
                            </Link>
                        </div>
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="비밀번호"
                                className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-primary pr-32"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Link
                                to="/reset-password"
                                className="absolute right-0 top-0 h-full px-4 flex items-center text-sm text-gray-500 hover:text-primary"
                            >
                                비밀번호를 잊었나요?
                            </Link>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="saveEmail"
                                checked={saveEmail}
                                onChange={(e) => setSaveEmail(e.target.checked)}
                                className="mr-2"
                            />
                            <label htmlFor="saveEmail" className="text-sm text-gray-600">
                                이메일 저장
                            </label>
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

                        <div className="mt-6 flex justify-center space-x-4">
                            <a
                                href={`${socialLoginForKakaoUrl}?redirectUrl=${redirectUrlAfterSocialLogin}`}
                                className="w-14 h-14 flex items-center justify-center hover:opacity-80 transition-opacity"
                            >
                                <img src={kakaoSimpleIcon} alt="카카오 로그인" className="w-14 h-14" />
                            </a>

                            <a
                                href={`${socialLoginForNaverUrl}?redirectUrl=${redirectUrlAfterSocialLogin}`}
                                className="w-14 h-14 flex items-center justify-center hover:opacity-80 transition-opacity"
                            >
                                <img src={naverSimpleIcon} alt="네이버 로그인" className="w-14 h-14" />
                            </a>

                            <a
                                href={`${socialLoginForGoogleUrl}?redirectUrl=${redirectUrlAfterSocialLogin}`}
                                className="w-14 h-14 flex items-center justify-center hover:opacity-80 transition-opacity"
                            >
                                <img src={googleSimpleIcon} alt="구글 로그인" className="w-14 h-14" />
                            </a>

                            <a
                                href={`${socialLoginForGithubUrl}?redirectUrl=${redirectUrlAfterSocialLogin}`}
                                className="w-14 h-14 flex items-center justify-center hover:opacity-80 transition-opacity"
                            >
                                <img src={githubSimpleIcon} alt="깃허브 로그인" className="w-14 h-14" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;