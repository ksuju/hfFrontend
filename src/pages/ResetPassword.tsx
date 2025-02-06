import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../components/AuthHeader';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [showVerification, setShowVerification] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/auth/password/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                setShowVerification(true);
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '비밀번호 재설정 요청에 실패했습니다.');
            }
        } catch (error) {
            alert('서버 연결에 실패했습니다.');
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/auth/password/reset/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: verificationCode })
            });

            if (response.ok) {
                setShowNewPassword(true);
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '인증번호가 일치하지 않습니다.');
            }
        } catch (error) {
            alert('서버 연결에 실패했습니다.');
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/auth/password/reset/new`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, newPassword: newPassword })
            });

            if (response.ok) {
                alert('비밀번호가 성공적으로 변경되었습니다.');
                navigate('/login');
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '비밀번호 변경에 실패했습니다.');
            }
        } catch (error) {
            alert('서버 연결에 실패했습니다.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <AuthHeader />
            <div className="flex-1 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-semibold text-center mb-6">비밀번호 찾기</h2>
                    {!showVerification ? (
                        <form onSubmit={handleRequestReset} className="space-y-4">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="이메일"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-primary pr-24"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-0 top-0 h-full px-6 text-base font-medium text-primary border-l border-gray-200 hover:bg-primary hover:text-white transition-colors rounded-r-lg"
                                >
                                    인증하기
                                </button>
                            </div>
                        </form>
                    ) : !showNewPassword ? (
                        <form onSubmit={handleVerifyCode} className="space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="인증번호"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-primary pr-24"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-0 top-0 h-full px-6 text-base font-medium text-primary border-l border-gray-200 hover:bg-primary hover:text-white transition-colors rounded-r-lg"
                                >
                                    확인
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handlePasswordReset} className="space-y-4">
                            <input
                                type="password"
                                placeholder="새 비밀번호"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full h-12 px-4 border border-gray-200 rounded-lg"
                            />
                            <input
                                type="password"
                                placeholder="새 비밀번호 확인"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full h-12 px-4 border border-gray-200 rounded-lg"
                            />
                            <button
                                type="submit"
                                className="w-full h-12 bg-primary text-white rounded-lg"
                            >
                                비밀번호 변경
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;