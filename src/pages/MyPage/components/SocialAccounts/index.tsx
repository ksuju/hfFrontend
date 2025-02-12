import SocialAccountCard from './SocialAccountCard';
import { UserInfo } from '../../types';

interface SocialAccountsProps {
    userInfo: UserInfo;
    onUpdate: () => void;
}

const SocialAccounts = ({ userInfo, onUpdate }: SocialAccountsProps) => {
    // 고정된 순서로 소셜 계정 배열 정의
    const socialTypes = ['KAKAO', 'NAVER', 'GOOGLE', 'GITHUB'] as const;

    const defaultSocialAccount = {
        active: false,
        email: '',
        createDate: new Date().toISOString()
    };



    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="space-y-4">
                {socialTypes.map((type) => (
                    <SocialAccountCard
                        key={type}
                        type={type}
                        account={userInfo.socialAccounts[type] || defaultSocialAccount}
                        onSocialAction={() => {
                            window.sessionStorage.setItem('needsUpdate', 'true');
                            onUpdate();
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default SocialAccounts;