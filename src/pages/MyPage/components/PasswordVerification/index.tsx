import { useState } from 'react';
import CreatePassword from './CreatePassword';
import VerifyPassword from './VerifyPassword';
import { UserInfo } from '../../types';

interface PasswordVerificationProps {
    userInfo: UserInfo;
    setIsPasswordVerified: (verified: boolean) => void;
}

const PasswordVerification = ({ userInfo, setIsPasswordVerified }: PasswordVerificationProps) => {
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handlePasswordVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members/me/password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ password })
            });

            if (response.ok) {
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
                    <VerifyPassword
                        password={password}
                        setPassword={setPassword}
                        handlePasswordVerify={handlePasswordVerify}
                    />
                )}
            </div>
        </div>
    );
};

export default PasswordVerification;