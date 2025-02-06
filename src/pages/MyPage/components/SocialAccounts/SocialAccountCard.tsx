import { SocialAccount } from '../../types';

import { useState } from 'react';
import kakaoIcon from '../../../../assets/images/kakaotalk_simple_icon.png';
import googleIcon from '../../../../assets/images/google_simple_icon.png';
import naverIcon from '../../../../assets/images/naver_simple_icon.png';
import githubIcon from '../../../../assets/images/github_simple_icon.png';

interface SocialAccountCardProps {
    type: 'KAKAO' | 'NAVER' | 'GOOGLE' | 'GITHUB';
    account: SocialAccount;
    onSocialAction: () => void;
}

const getSocialIcon = (type: string) => {
    const icons = {
        KAKAO: kakaoIcon,
        GOOGLE: googleIcon,
        NAVER: naverIcon,
        GITHUB: githubIcon
    };
    return icons[type as keyof typeof icons];
};

const SocialAccountCard = ({ type, account, onSocialAction }: SocialAccountCardProps) => {
    const [isLoading, setIsLoading] = useState(false);

    // 소셜 로그인 URL 설정
    const socialLoginUrl = `${import.meta.env.VITE_CORE_API_BASE_URL}/oauth2/authorization/${type.toLowerCase()}`;
    const redirectUrl = "http://localhost:5173/mypage";

    const handleSocialLink = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members/me/social/${type.toLowerCase()}/validate`,
                {
                    method: 'GET',
                    credentials: 'include',
                }
            );

            if (response.ok) {
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
                    onSocialAction();
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
            if (!window.confirm(`${type} 계정 연동을 해제하시겠습니까?`)) {
                return;
            }
        }

        setIsLoading(true);

        if (account.active) {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/members/me/social/${type.toLowerCase()}`,
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
        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-4">
                <img src={getSocialIcon(type)} alt={type} className="w-8 h-8" />
            </div>
            <div className="flex items-center gap-20 mr-2">
                {account?.active && (
                    <>
                        <div className="text-gray-600">
                            <span className="text-gray-500 font-medium">이메일: </span>
                            {account.email || '연동된 이메일 없음'}
                        </div>
                        {account.createDate && (
                            <div className="text-gray-600">
                                <span className="text-gray-500 font-medium">연동일: </span>
                                {new Date(account.createDate).toLocaleDateString()}
                            </div>
                        )}
                    </>
                )}
            </div>
            <button
                onClick={handleSocialAction}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${account?.active
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
            >
                {account?.active ? '연동 해제' : '연동하기'}
            </button>
        </div>
    );
};

export default SocialAccountCard;