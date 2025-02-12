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

    const apiUrl = import.meta.env.VITE_CORE_API_BASE_URL;

    // 소셜 로그인 URL 설정
    const socialLoginUrl = `${apiUrl}/oauth2/authorization/${type.toLowerCase()}`;
    const redirectUrl = `${import.meta.env.VITE_CORE_FRONT_BASE_URL}/mypage`;

    const handleSocialLink = async () => {
        try {
            const response = await fetch(
                `${apiUrl}/api/v1/members/me/social/${type.toLowerCase()}/validate`,
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
                    `${apiUrl}/api/v1/auth/me`,  // /members/me 대신 /auth/me 사용
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
                    `${apiUrl}/api/v1/members/me/social/${type.toLowerCase()}`,
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
        <div className={`flex items-center justify-between p-3 border rounded-lg ${account.active ? 'bg-primary/5' : ''}`}>
            <div className="flex items-center gap-3">
                <img src={getSocialIcon(type)} alt={type} className="w-8 h-8" />
                <span className="font-medium">{type}</span>
            </div>
            <div className="flex items-center gap-4">
                {account.active ? (
                    <>
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-sm text-gray-700">
                                {account.email}
                            </span>
                            <span className="text-xs text-gray-500">
                                {new Date(account.createDate).toLocaleDateString()}
                            </span>
                        </div>
                        <button
                            onClick={handleSocialAction}
                            className="px-2 py-1 text-sm bg-primary text-white rounded"
                            disabled={isLoading}
                        >
                            {isLoading ? '처리중...' : 'ON'}
                        </button>
                    </>
                ) : (
                    <>
                        <span className="text-sm text-gray-400">
                            연동 정보 없음
                        </span>
                        <button
                            onClick={handleSocialAction}
                            className="px-2 py-1 text-sm bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors"
                            disabled={isLoading}
                        >
                            {isLoading ? '처리중...' : '연동하기'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default SocialAccountCard;