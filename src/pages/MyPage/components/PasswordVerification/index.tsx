import { useState, useEffect } from 'react';
import CreatePassword from './CreatePassword';
import VerifyPassword from './VerifyPassword';
import { UserInfo } from '../../types';

interface PasswordVerificationProps {
    userInfo: UserInfo;
    setUserInfo: (userInfo: UserInfo) => void;
    setIsPasswordVerified: (verified: boolean) => void;
}

const PasswordVerification = ({ userInfo, setUserInfo, setIsPasswordVerified }: PasswordVerificationProps) => {
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [verificationToken, setVerificationToken] = useState(() =>
        localStorage.getItem('password-verification-token')
    );

    useEffect(() => {
        // 저장된 토큰이 있다면 유효성 검사
        if (verificationToken) {
            validateStoredToken();
        }
    }, []);

    const validateStoredToken = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members/me/password/validate`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ token: verificationToken })
                }
            );

            if (response.ok) {
                setIsPasswordVerified(true);
            } else {
                // 토큰이 유효하지 않으면 저장된 토큰 삭제
                localStorage.removeItem('password-verification-token');
                setVerificationToken(null);
            }
        } catch (error) {
            console.error('토큰 검증 에러:', error);
            localStorage.removeItem('password-verification-token');
            setVerificationToken(null);
        }
    };

    const handlePasswordVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members/me/password`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ password })
                }
            );

            if (response.ok) {
                const data = await response.json();
                // 받은 토큰을 localStorage에 저장
                localStorage.setItem('password-verification-token', data.data.token);
                setVerificationToken(data.data.token);
                setIsPasswordVerified(true);
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '비밀번호가 일치하지 않습니다.');
            }
        } catch (error) {
            console.error('비밀번호 확인 에러:', error);
            alert('서버 연결에 실패했습니다.');
        }
    };

    const handleCreatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            setPasswordError('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members/me/social/password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ password: newPassword })
            });

            if (response.ok) {
                const data = await response.json();

                // 비밀번호 설정 후 사용자 정보 다시 조회
                const userInfoResponse = await fetch(
                    `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/auth/me`,
                    {
                        credentials: 'include'
                    }
                );

                if (userInfoResponse.ok) {
                    const userInfoData = await userInfoResponse.json();
                    localStorage.setItem('userInfo', JSON.stringify(userInfoData)); // 로컬스토리지도 업데이트
                    setUserInfo(userInfoData.data); // userInfo 상태 업데이트
                }

                alert(data.msg || '비밀번호가 설정되었습니다.');
                setIsPasswordVerified(true);
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '비밀번호 설정에 실패했습니다.');
            }
        } catch (error) {
            console.error('비밀번호 설정 에러:', error);
            alert('서버 연결에 실패했습니다.');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="max-w-md mx-auto">
                {userInfo.onlySocialAccount ? (
                    <CreatePassword
                        newPassword={newPassword}
                        confirmNewPassword={confirmNewPassword}
                        passwordError={passwordError}
                        setNewPassword={setNewPassword}
                        setConfirmNewPassword={setConfirmNewPassword}
                        handleCreatePassword={handleCreatePassword}
                    />
                ) : (
                    !verificationToken && (
                        <VerifyPassword
                            password={password}
                            setPassword={setPassword}
                            handlePasswordVerify={handlePasswordVerify}
                        />
                    )
                )}
            </div>
        </div>
    );
};

export default PasswordVerification;