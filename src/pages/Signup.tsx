import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthHeader from '../components/AuthHeader';

const Signup = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setPasswordError('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const apiUrl = import.meta.env.VITE_CORE_API_BASE_URL + '/api/v1/auth/signup';
            console.log('요청 URL:', apiUrl);

            const requestData = {
                email,
                password,
                nickname
            };
            console.log('요청 데이터:', requestData);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.msg || '회원가입 실패했습니다.');
                return;
            }

            const data = await response.json();
            console.log('회원가입 성공:', data);
            alert('회원가입이 완료되었습니다.');
            navigate('/login');

        } catch (error) {
            console.error('회원가입 에러:', error);
            alert(error instanceof Error ? error.message : '서버 연결에 실패했습니다.');
        }
    };

    // 이메일 인증 요청
    const handleEmailVerification = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/auth/email/verification-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.msg || '인증번호가 발송되었습니다.');
                setIsEmailSent(true);
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '인증번호 발송에 실패했습니다.');
            }
        } catch (error) {
            console.error('이메일 인증 요청 에러:', error);
            alert('서버 연결에 실패했습니다.');
        }
    };

    // 인증번호 확인
    const handleVerifyCode = async () => {
        try {
            console.log('Sending verification request:', {
                email,
                code: verificationCode
            });
            const response = await fetch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/auth/email/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    code: verificationCode
                })
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.msg || '이메일 인증이 완료되었습니다.');
                setIsEmailVerified(true);
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '인증번호가 일치하지 않습니다.');
            }
        } catch (error) {
            console.error('인증번호 확인 에러:', error);
            alert('서버 연결에 실패했습니다.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <AuthHeader />
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="max-w-[430px] w-full bg-white rounded-2xl shadow-md p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800">회원가입</h2>
                        <p className="text-gray-500 mt-2">정보를 입력해주세요</p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="이메일"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-primary pr-24"
                            />
                            <button
                                type="button"
                                onClick={handleEmailVerification}
                                disabled={isEmailVerified}
                                className="absolute right-0 top-0 h-full px-6 text-base font-medium text-primary border-l border-gray-200 hover:bg-primary hover:text-white transition-colors rounded-r-lg"
                            >
                                인증
                            </button>
                        </div>

                        {isEmailSent && (
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="인증번호 입력"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-primary pr-24"
                                />
                                <button
                                    type="button"
                                    onClick={handleVerifyCode}
                                    disabled={isEmailVerified}
                                    className="absolute right-0 top-0 h-full px-6 text-base font-medium text-primary border-l border-gray-200 hover:bg-primary hover:text-white transition-colors rounded-r-lg"
                                >
                                    확인
                                </button>
                            </div>
                        )}

                        <div>
                            <input
                                type="password"
                                placeholder="비밀번호"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="비밀번호 확인"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                            {passwordError && (
                                <p className="mt-1 text-sm text-red-500">{passwordError}</p>
                            )}
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="닉네임"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
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