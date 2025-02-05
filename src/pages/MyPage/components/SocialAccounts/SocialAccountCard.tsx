import { SocialAccount } from '../../types';
import { useState } from 'react';

interface SocialAccountCardProps {
    provider: 'KAKAO' | 'NAVER' | 'GOOGLE' | 'GITHUB';
    icon: string;
    name: string;
    account: SocialAccount;
    onSocialLink: () => void;
}

const SocialAccountCard = ({ provider, icon, name, account, onSocialLink }: SocialAccountCardProps) => {
    const [isLoading, setIsLoading] = useState(false);

    // 소셜 로그인 URL 설정
    const socialLoginUrl = `${import.meta.env.VITE_CORE_API_BASE_URL}/oauth2/authorization/${provider.toLowerCase()}`;
    const redirectUrl = "http://localhost:5173/mypage";

    const handleSocialLink = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members/me/social/${provider.toLowerCase()}/validate`,
                {
                    method: 'GET',
                    credentials: 'include',
                }
            );

            if (response.ok) {
                // 소셜 연동 페이지로 이동하기 전에 콜백 등록
                window.sessionStorage.setItem('needsUpdate', 'true');
                window.location.href = `${socialLoginUrl}?redirectUrl=${redirectUrl}`;
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '소셜 계정 연동 준비에 실패했습니다.');
            }
        } catch (error) {
            console.error('소셜 연동 검증 에러:', error);
            alert('서버 연결에 실패했습니다.');
        }
    };

    const retryFetchUserInfo = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/auth/me`,  // /members/me 대신 /auth/me 사용
                    {
                        credentials: 'include'
                    }
                );

                if (response.ok) {
                    onSocialLink();
                    return true;
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error('회원 정보 조회 실패:', error);
                if (i === retries - 1) {
                    alert('회원 정보 업데이트에 실패했습니다.');
                }
            }
        }
        return false;
    };

    const handleSocialAction = async () => {
        if (isLoading) return;

        if (account.active) {
            // 연동 해제 전 확인
            if (!window.confirm(`${name} 계정 연동을 해제하시겠습니까?`)) {
                return;
            }
        }

        setIsLoading(true);

        if (account.active) {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members/me/social/${provider.toLowerCase()}`,
                    {
                        method: 'DELETE',
                        credentials: 'include',
                    }
                );

                if (response.ok) {
                    await retryFetchUserInfo();
                } else {
                    alert('소셜 계정 연동 해제에 실패했습니다.');
                }
            } catch (error) {
                console.error('소셜 연동 해제 에러:', error);
                alert('서버 연결에 실패했습니다.');
            } finally {
                setIsLoading(false);
            }
        } else {
            handleSocialLink();
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
                <img src={icon} alt={name} className="w-8 h-8" />
                <span className="font-medium">{name}</span>
            </div>
            <div className="flex items-center gap-6">
                {account.active ? (
                    <>
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-sm text-gray-500">
                                연동일: {new Date(account.createDate).toLocaleDateString()}
                            </span>
                            {account.email && (
                                <span className="text-sm text-gray-500">
                                    이메일: {account.email}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleSocialAction}
                            disabled={isLoading}
                            className={`px-3 py-1.5 text-sm ${isLoading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-red-500 hover:bg-red-600'
                                } text-white rounded`}
                        >
                            {isLoading ? '처리 중...' : '연동해제'}
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleSocialAction}
                        disabled={isLoading}
                        className={`px-3 py-1.5 text-sm ${isLoading
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-primary hover:bg-primary/90'
                            } text-white rounded`}
                    >
                        {isLoading ? '처리 중...' : '연동하기'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default SocialAccountCard;