import { SocialAccount } from '../../types';

interface SocialAccountCardProps {
    provider: 'KAKAO' | 'NAVER' | 'GOOGLE' | 'GITHUB';
    icon: string;
    name: string;
    account: SocialAccount;
}

const SocialAccountCard = ({ provider, icon, name, account }: SocialAccountCardProps) => {
    // 소셜 로그인 URL 설정
    const socialLoginUrl = `${import.meta.env.VITE_CORE_API_BASE_URL}/oauth2/authorization/${provider.toLowerCase()}`;
    const redirectUrl = "http://localhost:5173";

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

    return (
        <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
                <img src={icon} alt={name} className="w-8 h-8" />
                <span className="font-medium">{name}</span>
            </div>
            <div className="flex items-center gap-4">
                {account.active ? (
                    <>
                        <span className="text-sm text-gray-500">
                            {new Date(account.createDate).toLocaleDateString()}
                        </span>
                        <span className="px-2 py-1 text-sm bg-primary text-white rounded">ON</span>
                    </>
                ) : (
                    <button
                        onClick={handleSocialLink}
                        className="px-2 py-1 text-sm bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors cursor-pointer"
                    >
                        연동하기
                    </button>
                )}
            </div>
        </div>
    );
};

export default SocialAccountCard;